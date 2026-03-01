package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.AlerteDto;
import com.goodgovit.stc.entity.Alerte;
import com.goodgovit.stc.entity.CapteurIoT;
import com.goodgovit.stc.entity.Salle;
import com.goodgovit.stc.entity.enums.SourceDonnee;
import com.goodgovit.stc.entity.enums.StatutAlerte;
import com.goodgovit.stc.entity.enums.TypeAlerte;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.mqtt.MqttPayloadSchemas;
import com.goodgovit.stc.repository.AlerteRepository;
import com.goodgovit.stc.repository.CapteurIoTRepository;
import com.goodgovit.stc.repository.SalleRepository;
import com.goodgovit.stc.websocket.WebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlerteService {

    private final AlerteRepository alerteRepository;
    private final SalleRepository salleRepository;
    private final CapteurIoTRepository capteurRepository;
    private final WebSocketHandler webSocketHandler;

    /**
     * Check temperature threshold and create alert if exceeded.
     * Threshold: > 30°C
     */
    @Transactional
    public void checkTemperatureThreshold(Long salleId, Long capteurId, float value, SourceDonnee source) {
        if (value > MqttPayloadSchemas.TEMPERATURE_THRESHOLD) {
            String message = String.format("Température élevée détectée: %.1f°C (seuil: %.1f°C)",
                    value, MqttPayloadSchemas.TEMPERATURE_THRESHOLD);
            createAlert(TypeAlerte.TEMPERATURE_ELEVEE, message, salleId, capteurId, source);
        }
    }

    /**
     * Check CO2 threshold and create alert if exceeded.
     * Threshold: > 1000 ppm
     */
    @Transactional
    public void checkCo2Threshold(Long salleId, Long capteurId, float value, SourceDonnee source) {
        if (value > MqttPayloadSchemas.CO2_THRESHOLD) {
            String message = String.format("Niveau de CO₂ élevé détecté: %.0f ppm (seuil: %.0f ppm)",
                    value, MqttPayloadSchemas.CO2_THRESHOLD);
            createAlert(TypeAlerte.CO2_ELEVE, message, salleId, capteurId, source);
        }
    }

    /**
     * Create a device offline alert.
     */
    @Transactional
    public void createDeviceOfflineAlert(Long capteurId, SourceDonnee source) {
        CapteurIoT capteur = capteurRepository.findById(capteurId).orElse(null);
        if (capteur == null) return;

        String message = String.format("Appareil hors ligne: %s (MAC: %s)",
                capteur.getType().name(), capteur.getAdresseMac());
        createAlert(TypeAlerte.DEVICE_OFFLINE, message, capteur.getSalle().getId(), capteurId, source);
    }

    /**
     * General alert creation method.
     */
    @Transactional
    public void createAlert(TypeAlerte type, String message, Long salleId, Long capteurId, SourceDonnee source) {
        Salle salle = salleId != null ? salleRepository.findById(salleId).orElse(null) : null;
        CapteurIoT capteur = capteurId != null ? capteurRepository.findById(capteurId).orElse(null) : null;

        Alerte alerte = Alerte.builder()
                .type(type)
                .message(message)
                .dateHeure(LocalDateTime.now())
                .statut(StatutAlerte.ACTIVE)
                .source(source)
                .salle(salle)
                .capteur(capteur)
                .build();

        Alerte saved = alerteRepository.save(alerte);
        log.warn("Alert created: {} - {}", type, message);

        // Push alert via WebSocket
        webSocketHandler.pushAlert(toDto(saved));
    }

    @Transactional(readOnly = true)
    public List<AlerteDto> getActiveAlertes() {
        return alerteRepository.findByStatut(StatutAlerte.ACTIVE).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlerteDto> getAllAlertes() {
        return alerteRepository.findAll().stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlerteDto> getAlertesBySalle(Long salleId) {
        return alerteRepository.findBySalleId(salleId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public AlerteDto traiterAlerte(Long id) {
        Alerte alerte = alerteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte non trouvée avec l'id: " + id));
        alerte.setStatut(StatutAlerte.TRAITEE);
        return toDto(alerteRepository.save(alerte));
    }

    @Transactional(readOnly = true)
    public long countActiveAlertes() {
        return alerteRepository.countByStatut(StatutAlerte.ACTIVE);
    }

    private AlerteDto toDto(Alerte a) {
        return AlerteDto.builder()
                .id(a.getId())
                .type(a.getType().name())
                .message(a.getMessage())
                .dateHeure(a.getDateHeure())
                .statut(a.getStatut().name())
                .source(a.getSource().name())
                .salleId(a.getSalle() != null ? a.getSalle().getId() : null)
                .salleNom(a.getSalle() != null ? a.getSalle().getNomSalle() : null)
                .capteurId(a.getCapteur() != null ? a.getCapteur().getId() : null)
                .build();
    }
}
