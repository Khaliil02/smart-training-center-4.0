package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.InscriptionCoursDto;
import com.goodgovit.stc.dto.ProgressionRequest;
import com.goodgovit.stc.entity.Cours;
import com.goodgovit.stc.entity.Etudiant;
import com.goodgovit.stc.entity.InscriptionCours;
import com.goodgovit.stc.entity.enums.EtatInscription;
import com.goodgovit.stc.entity.enums.StatutCours;
import com.goodgovit.stc.exception.BadRequestException;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.CoursRepository;
import com.goodgovit.stc.repository.EtudiantRepository;
import com.goodgovit.stc.repository.InscriptionCoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InscriptionService {

    private final InscriptionCoursRepository inscriptionRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final AuditService auditService;

    @Transactional
    public InscriptionCoursDto enrollStudent(Long etudiantId, Long coursId) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant non trouvé avec l'id: " + etudiantId));

        Cours cours = coursRepository.findById(coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Cours non trouvé avec l'id: " + coursId));

        if (cours.getStatut() != StatutCours.PUBLIE) {
            throw new BadRequestException("Impossible de s'inscrire à un cours non publié");
        }

        if (inscriptionRepository.findByEtudiantIdAndCoursId(etudiantId, coursId).isPresent()) {
            throw new BadRequestException("L'étudiant est déjà inscrit à ce cours");
        }

        InscriptionCours inscription = InscriptionCours.builder()
                .etudiant(etudiant)
                .cours(cours)
                .build();

        InscriptionCours saved = inscriptionRepository.save(inscription);
        auditService.log("ENROLL", "InscriptionCours", saved.getId(),
                etudiant.getUtilisateur().getId(),
                "Inscription au cours: " + cours.getTitre());

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<InscriptionCoursDto> getInscriptionsByEtudiant(Long etudiantId) {
        return inscriptionRepository.findByEtudiantId(etudiantId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InscriptionCoursDto> getInscriptionsByCours(Long coursId) {
        return inscriptionRepository.findByCoursId(coursId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InscriptionCoursDto getProgression(Long etudiantId, Long coursId) {
        InscriptionCours inscription = inscriptionRepository.findByEtudiantIdAndCoursId(etudiantId, coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription non trouvée"));
        return toDto(inscription);
    }

    @Transactional
    public InscriptionCoursDto updateProgression(Long inscriptionId, ProgressionRequest request) {
        InscriptionCours inscription = inscriptionRepository.findById(inscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription non trouvée avec l'id: " + inscriptionId));

        inscription.setProgression(request.getProgression());
        inscription.setDateDernierAcces(LocalDateTime.now());

        if (request.getProgression() >= 100.0f) {
            inscription.setEtat(EtatInscription.TERMINE);
        }

        return toDto(inscriptionRepository.save(inscription));
    }

    /**
     * Checks if a student has passed the threshold (>= 80%) for a given course evaluation.
     * This is the conditional progression requirement from the spec.
     */
    @Transactional(readOnly = true)
    public boolean checkProgressionCondition(Long etudiantId, Long coursId, float seuil) {
        InscriptionCours inscription = inscriptionRepository.findByEtudiantIdAndCoursId(etudiantId, coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription non trouvée"));
        return inscription.getProgression() >= seuil;
    }

    @Transactional
    public InscriptionCoursDto updateNoteFinale(Long etudiantId, Long coursId, float note) {
        InscriptionCours inscription = inscriptionRepository.findByEtudiantIdAndCoursId(etudiantId, coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription non trouvée"));
        inscription.setNoteFinale(note);
        return toDto(inscriptionRepository.save(inscription));
    }

    @Transactional
    public void abandonCours(Long etudiantId, Long coursId) {
        InscriptionCours inscription = inscriptionRepository.findByEtudiantIdAndCoursId(etudiantId, coursId)
                .orElseThrow(() -> new ResourceNotFoundException("Inscription non trouvée"));
        inscription.setEtat(EtatInscription.ABANDONNE);
        inscriptionRepository.save(inscription);
    }

    private InscriptionCoursDto toDto(InscriptionCours i) {
        return InscriptionCoursDto.builder()
                .id(i.getId())
                .dateInscription(i.getDateInscription())
                .progression(i.getProgression())
                .noteFinale(i.getNoteFinale())
                .etat(i.getEtat().name())
                .dateDernierAcces(i.getDateDernierAcces())
                .etudiantId(i.getEtudiant().getId())
                .etudiantMatricule(i.getEtudiant().getMatricule())
                .etudiantNom(i.getEtudiant().getUtilisateur().getNom() + " " + i.getEtudiant().getUtilisateur().getPrenom())
                .coursId(i.getCours().getId())
                .coursTitre(i.getCours().getTitre())
                .build();
    }
}
