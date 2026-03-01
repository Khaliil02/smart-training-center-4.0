package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.CoursDto;
import com.goodgovit.stc.dto.CoursRequest;
import com.goodgovit.stc.entity.Cours;
import com.goodgovit.stc.entity.Enseignant;
import com.goodgovit.stc.entity.Salle;
import com.goodgovit.stc.entity.enums.StatutCours;
import com.goodgovit.stc.exception.BadRequestException;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.CoursRepository;
import com.goodgovit.stc.repository.EnseignantRepository;
import com.goodgovit.stc.repository.InscriptionCoursRepository;
import com.goodgovit.stc.repository.SalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoursService {

    private final CoursRepository coursRepository;
    private final EnseignantRepository enseignantRepository;
    private final SalleRepository salleRepository;
    private final InscriptionCoursRepository inscriptionCoursRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<CoursDto> getAllCours(Pageable pageable) {
        return coursRepository.findAll(pageable).map(this::toCoursDto);
    }

    @Transactional(readOnly = true)
    public List<CoursDto> getActiveCours() {
        return coursRepository.findByEstActifTrue().stream()
                .map(this::toCoursDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CoursDto getCoursById(Long id) {
        return toCoursDto(findCoursOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<CoursDto> getCoursByEnseignant(Long enseignantId) {
        return coursRepository.findByEnseignantId(enseignantId).stream()
                .map(this::toCoursDto).collect(Collectors.toList());
    }

    @Transactional
    public CoursDto createCours(CoursRequest request, Long enseignantId) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new ResourceNotFoundException("Enseignant non trouvé avec l'id: " + enseignantId));

        Cours cours = Cours.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .contenu(request.getContenu())
                .filiere(request.getFiliere())
                .niveau(request.getNiveau())
                .dureeEstimee(request.getDureeEstimee())
                .enseignant(enseignant)
                .statut(StatutCours.BROUILLON)
                .build();

        if (request.getSalleId() != null) {
            Salle salle = salleRepository.findById(request.getSalleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + request.getSalleId()));
            cours.setSalle(salle);
        }

        Cours saved = coursRepository.save(cours);
        auditService.log("CREATE", "Cours", saved.getId(), enseignant.getUtilisateur().getId(),
                "Cours créé: " + saved.getTitre());
        return toCoursDto(saved);
    }

    @Transactional
    public CoursDto updateCours(Long id, CoursRequest request) {
        Cours cours = findCoursOrThrow(id);
        cours.setTitre(request.getTitre());
        cours.setDescription(request.getDescription());
        cours.setContenu(request.getContenu());
        cours.setFiliere(request.getFiliere());
        cours.setNiveau(request.getNiveau());
        cours.setDureeEstimee(request.getDureeEstimee());

        if (request.getSalleId() != null) {
            Salle salle = salleRepository.findById(request.getSalleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + request.getSalleId()));
            cours.setSalle(salle);
        }

        return toCoursDto(coursRepository.save(cours));
    }

    @Transactional
    public void deleteCours(Long id) {
        Cours cours = findCoursOrThrow(id);
        coursRepository.delete(cours);
    }

    @Transactional
    public CoursDto approveCours(Long id) {
        Cours cours = findCoursOrThrow(id);
        if (cours.getStatut() != StatutCours.BROUILLON) {
            throw new BadRequestException("Seuls les cours en BROUILLON peuvent être approuvés");
        }
        cours.setStatut(StatutCours.PUBLIE);
        auditService.log("APPROVE", "Cours", id, null, "Cours approuvé: " + cours.getTitre());
        return toCoursDto(coursRepository.save(cours));
    }

    @Transactional
    public CoursDto archiveCours(Long id) {
        Cours cours = findCoursOrThrow(id);
        cours.setStatut(StatutCours.ARCHIVE);
        cours.setEstActif(false);
        return toCoursDto(coursRepository.save(cours));
    }

    private Cours findCoursOrThrow(Long id) {
        return coursRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cours non trouvé avec l'id: " + id));
    }

    private CoursDto toCoursDto(Cours c) {
        return CoursDto.builder()
                .id(c.getId())
                .titre(c.getTitre())
                .description(c.getDescription())
                .contenu(c.getContenu())
                .filiere(c.getFiliere())
                .niveau(c.getNiveau())
                .dureeEstimee(c.getDureeEstimee())
                .estActif(c.isEstActif())
                .statut(c.getStatut().name())
                .enseignantId(c.getEnseignant() != null ? c.getEnseignant().getId() : null)
                .enseignantNom(c.getEnseignant() != null && c.getEnseignant().getUtilisateur() != null
                        ? c.getEnseignant().getUtilisateur().getNom() + " " + c.getEnseignant().getUtilisateur().getPrenom()
                        : null)
                .salleId(c.getSalle() != null ? c.getSalle().getId() : null)
                .salleNom(c.getSalle() != null ? c.getSalle().getNomSalle() : null)
                .nombreInscrits(inscriptionCoursRepository.countByCoursId(c.getId()))
                .build();
    }
}
