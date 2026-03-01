package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.PresenceDto;
import com.goodgovit.stc.dto.ScanRequest;
import com.goodgovit.stc.entity.Etudiant;
import com.goodgovit.stc.entity.Presence;
import com.goodgovit.stc.entity.RfidQr;
import com.goodgovit.stc.entity.Salle;
import com.goodgovit.stc.entity.enums.MethodePresence;
import com.goodgovit.stc.entity.enums.SourceDonnee;
import com.goodgovit.stc.exception.BadRequestException;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.EtudiantRepository;
import com.goodgovit.stc.repository.PresenceRepository;
import com.goodgovit.stc.repository.RfidQrRepository;
import com.goodgovit.stc.repository.SalleRepository;
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
public class PresenceService {

    private final PresenceRepository presenceRepository;
    private final RfidQrRepository rfidQrRepository;
    private final EtudiantRepository etudiantRepository;
    private final SalleRepository salleRepository;
    private final AuditService auditService;

    /**
     * Record a presence from a manual scan request (API fallback).
     */
    @Transactional
    public PresenceDto recordScan(ScanRequest request) {
        RfidQr badge = rfidQrRepository.findByCodeQR(request.getBadgeCode())
                .orElseThrow(() -> new ResourceNotFoundException("Badge non trouvé avec le code: " + request.getBadgeCode()));

        Salle salle = salleRepository.findById(request.getSalleId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + request.getSalleId()));

        Etudiant etudiant = badge.getEtudiant();

        SourceDonnee source = SourceDonnee.HARDWARE;
        if (request.getSource() != null) {
            source = SourceDonnee.valueOf(request.getSource());
        }

        Presence presence = Presence.builder()
                .etudiant(etudiant)
                .salle(salle)
                .methode(MethodePresence.valueOf(request.getMethode()))
                .source(source)
                .build();

        Presence saved = presenceRepository.save(presence);

        // Update badge last read time
        badge.setDateDerniereLecture(LocalDateTime.now());
        rfidQrRepository.save(badge);

        auditService.log("PRESENCE_SCAN", "Presence", saved.getId(),
                etudiant.getUtilisateur().getId(),
                "Scan " + request.getMethode() + " en salle " + salle.getNomSalle());

        return toDto(saved);
    }

    /**
     * Record a presence from an MQTT RFID scan message.
     */
    @Transactional
    public PresenceDto recordRfidScan(String badgeCode, Long salleId, SourceDonnee source) {
        RfidQr badge = rfidQrRepository.findByCodeQR(badgeCode)
                .orElse(null);

        if (badge == null) {
            log.warn("Badge code not found in system: {}", badgeCode);
            return null;
        }

        Salle salle = salleRepository.findById(salleId).orElse(null);
        if (salle == null) {
            log.warn("Salle ID not found: {}", salleId);
            return null;
        }

        Etudiant etudiant = badge.getEtudiant();

        Presence presence = Presence.builder()
                .etudiant(etudiant)
                .salle(salle)
                .methode(MethodePresence.RFID)
                .source(source)
                .build();

        Presence saved = presenceRepository.save(presence);

        badge.setDateDerniereLecture(LocalDateTime.now());
        rfidQrRepository.save(badge);

        log.info("RFID presence recorded: student {} in salle {} (source: {})",
                etudiant.getMatricule(), salle.getNomSalle(), source);

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PresenceDto> getPresencesBySalle(Long salleId) {
        return presenceRepository.findBySalleId(salleId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PresenceDto> getPresencesByEtudiant(Long etudiantId) {
        return presenceRepository.findByEtudiantId(etudiantId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PresenceDto> getPresencesBySalleAndDateRange(Long salleId, LocalDateTime from, LocalDateTime to) {
        return presenceRepository.findBySalleIdAndDateHeureBetween(salleId, from, to).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    private PresenceDto toDto(Presence p) {
        return PresenceDto.builder()
                .id(p.getId())
                .dateHeure(p.getDateHeure())
                .methode(p.getMethode().name())
                .source(p.getSource().name())
                .etudiantId(p.getEtudiant().getId())
                .etudiantNom(p.getEtudiant().getUtilisateur().getNom() + " " + p.getEtudiant().getUtilisateur().getPrenom())
                .etudiantMatricule(p.getEtudiant().getMatricule())
                .salleId(p.getSalle().getId())
                .salleNom(p.getSalle().getNomSalle())
                .build();
    }
}
