package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.BulletinDto;
import com.goodgovit.stc.dto.BulletinLigneDto;
import com.goodgovit.stc.entity.Etudiant;
import com.goodgovit.stc.entity.InscriptionCours;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.EtudiantRepository;
import com.goodgovit.stc.repository.InscriptionCoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BulletinService {

    private final EtudiantRepository etudiantRepository;
    private final InscriptionCoursRepository inscriptionCoursRepository;

    @Transactional(readOnly = true)
    public BulletinDto generateBulletin(Long etudiantId) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant non trouvé avec l'id: " + etudiantId));

        List<InscriptionCours> inscriptions = inscriptionCoursRepository.findByEtudiantId(etudiantId);

        List<BulletinLigneDto> lignes = inscriptions.stream()
                .map(this::toLigneDto)
                .collect(Collectors.toList());

        // Weighted average calculation
        float totalPonderee = 0;
        float totalCoefficients = 0;
        for (InscriptionCours inscription : inscriptions) {
            float coeff = 1.0f;
            if (!inscription.getCours().getEvaluations().isEmpty()) {
                coeff = inscription.getCours().getEvaluations().get(0).getCoefficient();
            }
            totalPonderee += inscription.getNoteFinale() * coeff;
            totalCoefficients += coeff;
        }

        float moyenneGenerale = totalCoefficients > 0 ? totalPonderee / totalCoefficients : 0;

        return BulletinDto.builder()
                .etudiantId(etudiant.getId())
                .etudiantNom(etudiant.getUtilisateur().getNom())
                .etudiantPrenom(etudiant.getUtilisateur().getPrenom())
                .matricule(etudiant.getMatricule())
                .moyenneGenerale(moyenneGenerale)
                .lignes(lignes)
                .build();
    }

    private BulletinLigneDto toLigneDto(InscriptionCours i) {
        float coefficient = 1.0f;
        if (!i.getCours().getEvaluations().isEmpty()) {
            coefficient = i.getCours().getEvaluations().get(0).getCoefficient();
        }

        return BulletinLigneDto.builder()
                .coursTitre(i.getCours().getTitre())
                .filiere(i.getCours().getFiliere())
                .noteFinale(i.getNoteFinale())
                .progression(i.getProgression())
                .etat(i.getEtat().name())
                .coefficient(coefficient)
                .notePonderee(i.getNoteFinale() * coefficient)
                .build();
    }
}
