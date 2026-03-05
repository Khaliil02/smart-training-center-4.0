package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.CapteurIoTDto;
import com.goodgovit.stc.dto.CapteurIoTRequest;
import com.goodgovit.stc.dto.EnvironnementDto;
import com.goodgovit.stc.entity.CapteurIoT;
import com.goodgovit.stc.entity.Salle;
import com.goodgovit.stc.entity.enums.TypeCapteur;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.CapteurIoTRepository;
import com.goodgovit.stc.repository.SalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CapteurService {

    private final CapteurIoTRepository capteurRepository;
    private final SalleRepository salleRepository;

    @Transactional(readOnly = true)
    public List<CapteurIoTDto> getCapteursBySalle(Long salleId) {
        return capteurRepository.findBySalleId(salleId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CapteurIoTDto getCapteurById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public CapteurIoTDto registerCapteur(CapteurIoTRequest request) {
        Salle salle = salleRepository.findById(request.getSalleId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + request.getSalleId()));

        CapteurIoT capteur = CapteurIoT.builder()
                .type(TypeCapteur.valueOf(request.getType()))
                .adresseMac(request.getAdresseMac())
                .firmwareVersion(request.getFirmwareVersion())
                .salle(salle)
                .build();

        return toDto(capteurRepository.save(capteur));
    }

    @Transactional
    public CapteurIoTDto updateCapteur(Long id, CapteurIoTRequest request) {
        CapteurIoT capteur = findOrThrow(id);
        Salle salle = salleRepository.findById(request.getSalleId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + request.getSalleId()));

        capteur.setType(TypeCapteur.valueOf(request.getType()));
        capteur.setAdresseMac(request.getAdresseMac());
        capteur.setFirmwareVersion(request.getFirmwareVersion());
        capteur.setSalle(salle);

        return toDto(capteurRepository.save(capteur));
    }

    @Transactional
    public void updateSensorReading(Long capteurId, float value) {
        CapteurIoT capteur = findOrThrow(capteurId);
        capteur.setValeurMesuree(value);
        capteur.setDateHeureMesure(LocalDateTime.now());
        capteur.setEstEnLigne(true);
        capteurRepository.save(capteur);
    }

    @Transactional
    public CapteurIoT updateSensorReadingByMac(String mac, float value) {
        CapteurIoT capteur = capteurRepository.findByAdresseMac(mac)
                .orElse(null);
        if (capteur != null) {
            capteur.setValeurMesuree(value);
            capteur.setDateHeureMesure(LocalDateTime.now());
            capteur.setEstEnLigne(true);
            capteurRepository.save(capteur);
        }
        return capteur;
    }

    @Transactional
    public void updateDeviceStatus(Long capteurId, boolean online, String firmware) {
        CapteurIoT capteur = findOrThrow(capteurId);
        capteur.setEstEnLigne(online);
        if (firmware != null) {
            capteur.setFirmwareVersion(firmware);
        }
        capteurRepository.save(capteur);
    }

    @Transactional(readOnly = true)
    public EnvironnementDto getEnvironnement(Long salleId) {
        Salle salle = salleRepository.findById(salleId)
                .orElseThrow(() -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + salleId));

        List<CapteurIoT> capteurs = capteurRepository.findBySalleId(salleId);

        Float temperature = null;
        LocalDateTime tempTimestamp = null;
        Float co2 = null;
        LocalDateTime co2Timestamp = null;
        Integer presenceCount = null;
        LocalDateTime presenceTimestamp = null;

        for (CapteurIoT c : capteurs) {
            switch (c.getType()) {
                case TEMPERATURE:
                    temperature = c.getValeurMesuree();
                    tempTimestamp = c.getDateHeureMesure();
                    break;
                case CO2:
                    co2 = c.getValeurMesuree();
                    co2Timestamp = c.getDateHeureMesure();
                    break;
                case PRESENCE:
                    presenceCount = (int) c.getValeurMesuree();
                    presenceTimestamp = c.getDateHeureMesure();
                    break;
                default:
                    break;
            }
        }

        return EnvironnementDto.builder()
                .salleId(salle.getId())
                .salleNom(salle.getNomSalle())
                .temperature(temperature)
                .temperatureTimestamp(tempTimestamp)
                .co2(co2)
                .co2Timestamp(co2Timestamp)
                .presenceCount(presenceCount)
                .presenceTimestamp(presenceTimestamp)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CapteurIoTDto> getOnlineCapteurs() {
        return capteurRepository.findByEstEnLigne(true).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CapteurIoTDto> getOfflineCapteurs() {
        return capteurRepository.findByEstEnLigne(false).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    private CapteurIoT findOrThrow(Long id) {
        return capteurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Capteur IoT non trouvé avec l'id: " + id));
    }

    private CapteurIoTDto toDto(CapteurIoT c) {
        return CapteurIoTDto.builder()
                .id(c.getId())
                .type(c.getType().name())
                .valeurMesuree(c.getValeurMesuree())
                .dateHeureMesure(c.getDateHeureMesure())
                .estEnLigne(c.isEstEnLigne())
                .firmwareVersion(c.getFirmwareVersion())
                .adresseMac(c.getAdresseMac())
                .salleId(c.getSalle().getId())
                .salleNom(c.getSalle().getNomSalle())
                .build();
    }
}
