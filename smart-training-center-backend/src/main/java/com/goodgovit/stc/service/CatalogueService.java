package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.entity.Certification;
import com.goodgovit.stc.entity.Filiere;
import com.goodgovit.stc.entity.Matiere;
import com.goodgovit.stc.entity.Specialite;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.CertificationRepository;
import com.goodgovit.stc.repository.FiliereRepository;
import com.goodgovit.stc.repository.MatiereRepository;
import com.goodgovit.stc.repository.SpecialiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogueService {

    private final FiliereRepository filiereRepository;
    private final SpecialiteRepository specialiteRepository;
    private final MatiereRepository matiereRepository;
    private final CertificationRepository certificationRepository;

    // ── Filiere ──

    @Transactional(readOnly = true)
    public List<FiliereDto> getAllFilieres() {
        return filiereRepository.findAll().stream().map(this::toFiliereDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FiliereDto getFiliereById(Long id) {
        return toFiliereDto(findFiliereOrThrow(id));
    }

    @Transactional
    public FiliereDto createFiliere(FiliereRequest request) {
        Filiere filiere = Filiere.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .niveau(request.getNiveau())
                .build();
        return toFiliereDto(filiereRepository.save(filiere));
    }

    @Transactional
    public FiliereDto updateFiliere(Long id, FiliereRequest request) {
        Filiere filiere = findFiliereOrThrow(id);
        filiere.setNom(request.getNom());
        filiere.setDescription(request.getDescription());
        filiere.setNiveau(request.getNiveau());
        return toFiliereDto(filiereRepository.save(filiere));
    }

    @Transactional
    public void deleteFiliere(Long id) {
        Filiere filiere = findFiliereOrThrow(id);
        filiereRepository.delete(filiere);
    }

    // ── Specialite ──

    @Transactional(readOnly = true)
    public List<SpecialiteDto> getAllSpecialites() {
        return specialiteRepository.findAll().stream().map(this::toSpecialiteDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SpecialiteDto> getSpecialitesByFiliere(Long filiereId) {
        return specialiteRepository.findByFiliereId(filiereId).stream().map(this::toSpecialiteDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SpecialiteDto getSpecialiteById(Long id) {
        return toSpecialiteDto(findSpecialiteOrThrow(id));
    }

    @Transactional
    public SpecialiteDto createSpecialite(SpecialiteRequest request) {
        Filiere filiere = findFiliereOrThrow(request.getFiliereId());
        Specialite specialite = Specialite.builder()
                .nom(request.getNom())
                .filiere(filiere)
                .build();
        return toSpecialiteDto(specialiteRepository.save(specialite));
    }

    @Transactional
    public SpecialiteDto updateSpecialite(Long id, SpecialiteRequest request) {
        Specialite specialite = findSpecialiteOrThrow(id);
        Filiere filiere = findFiliereOrThrow(request.getFiliereId());
        specialite.setNom(request.getNom());
        specialite.setFiliere(filiere);
        return toSpecialiteDto(specialiteRepository.save(specialite));
    }

    @Transactional
    public void deleteSpecialite(Long id) {
        Specialite specialite = findSpecialiteOrThrow(id);
        specialiteRepository.delete(specialite);
    }

    // ── Matiere ──

    @Transactional(readOnly = true)
    public List<MatiereDto> getAllMatieres() {
        return matiereRepository.findAll().stream().map(this::toMatiereDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MatiereDto> getMatieresBySpecialite(Long specialiteId) {
        return matiereRepository.findBySpecialiteId(specialiteId).stream().map(this::toMatiereDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MatiereDto getMatiereById(Long id) {
        return toMatiereDto(findMatiereOrThrow(id));
    }

    @Transactional
    public MatiereDto createMatiere(MatiereRequest request) {
        Specialite specialite = findSpecialiteOrThrow(request.getSpecialiteId());
        Matiere matiere = Matiere.builder()
                .nom(request.getNom())
                .coefficient(request.getCoefficient())
                .specialite(specialite)
                .build();
        return toMatiereDto(matiereRepository.save(matiere));
    }

    @Transactional
    public MatiereDto updateMatiere(Long id, MatiereRequest request) {
        Matiere matiere = findMatiereOrThrow(id);
        Specialite specialite = findSpecialiteOrThrow(request.getSpecialiteId());
        matiere.setNom(request.getNom());
        matiere.setCoefficient(request.getCoefficient());
        matiere.setSpecialite(specialite);
        return toMatiereDto(matiereRepository.save(matiere));
    }

    @Transactional
    public void deleteMatiere(Long id) {
        Matiere matiere = findMatiereOrThrow(id);
        matiereRepository.delete(matiere);
    }

    // ── Certification ──

    @Transactional(readOnly = true)
    public List<CertificationDto> getAllCertifications() {
        return certificationRepository.findAll().stream().map(this::toCertificationDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CertificationDto getCertificationById(Long id) {
        return toCertificationDto(findCertificationOrThrow(id));
    }

    @Transactional
    public CertificationDto createCertification(CertificationRequest request) {
        Certification cert = Certification.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .dateExpiration(request.getDateExpiration())
                .build();
        return toCertificationDto(certificationRepository.save(cert));
    }

    @Transactional
    public CertificationDto updateCertification(Long id, CertificationRequest request) {
        Certification cert = findCertificationOrThrow(id);
        cert.setNom(request.getNom());
        cert.setDescription(request.getDescription());
        cert.setDateExpiration(request.getDateExpiration());
        return toCertificationDto(certificationRepository.save(cert));
    }

    @Transactional
    public void deleteCertification(Long id) {
        Certification cert = findCertificationOrThrow(id);
        certificationRepository.delete(cert);
    }

    // ── Private helpers ──

    private Filiere findFiliereOrThrow(Long id) {
        return filiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filière non trouvée avec l'id: " + id));
    }

    private Specialite findSpecialiteOrThrow(Long id) {
        return specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité non trouvée avec l'id: " + id));
    }

    private Matiere findMatiereOrThrow(Long id) {
        return matiereRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée avec l'id: " + id));
    }

    private Certification findCertificationOrThrow(Long id) {
        return certificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certification non trouvée avec l'id: " + id));
    }

    // ── Mappers ──

    private FiliereDto toFiliereDto(Filiere f) {
        return FiliereDto.builder()
                .id(f.getId())
                .nom(f.getNom())
                .description(f.getDescription())
                .niveau(f.getNiveau())
                .specialites(f.getSpecialites() != null
                        ? f.getSpecialites().stream().map(this::toSpecialiteDtoLight).collect(Collectors.toList())
                        : null)
                .build();
    }

    private SpecialiteDto toSpecialiteDtoLight(Specialite s) {
        return SpecialiteDto.builder()
                .id(s.getId())
                .nom(s.getNom())
                .filiereId(s.getFiliere().getId())
                .build();
    }

    private SpecialiteDto toSpecialiteDto(Specialite s) {
        return SpecialiteDto.builder()
                .id(s.getId())
                .nom(s.getNom())
                .filiereId(s.getFiliere().getId())
                .filiereNom(s.getFiliere().getNom())
                .matieres(s.getMatieres() != null
                        ? s.getMatieres().stream().map(this::toMatiereDto).collect(Collectors.toList())
                        : null)
                .build();
    }

    private MatiereDto toMatiereDto(Matiere m) {
        return MatiereDto.builder()
                .id(m.getId())
                .nom(m.getNom())
                .coefficient(m.getCoefficient())
                .specialiteId(m.getSpecialite().getId())
                .specialiteNom(m.getSpecialite().getNom())
                .build();
    }

    private CertificationDto toCertificationDto(Certification c) {
        return CertificationDto.builder()
                .id(c.getId())
                .nom(c.getNom())
                .description(c.getDescription())
                .dateExpiration(c.getDateExpiration())
                .build();
    }
}
