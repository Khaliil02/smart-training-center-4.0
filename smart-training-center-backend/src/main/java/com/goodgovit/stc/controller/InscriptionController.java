package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.BulletinDto;
import com.goodgovit.stc.dto.InscriptionCoursDto;
import com.goodgovit.stc.dto.ProgressionRequest;
import com.goodgovit.stc.entity.Etudiant;
import com.goodgovit.stc.entity.Utilisateur;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.EtudiantRepository;
import com.goodgovit.stc.repository.UtilisateurRepository;
import com.goodgovit.stc.service.BulletinService;
import com.goodgovit.stc.service.InscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InscriptionController {

    private final InscriptionService inscriptionService;
    private final BulletinService bulletinService;
    private final UtilisateurRepository utilisateurRepository;
    private final EtudiantRepository etudiantRepository;

    @PostMapping("/cours/{coursId}/inscription")
    public ResponseEntity<InscriptionCoursDto> enroll(@PathVariable Long coursId,
            @RequestParam Long etudiantId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(inscriptionService.enrollStudent(etudiantId, coursId));
    }

    @GetMapping("/cours/{coursId}/inscriptions")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<List<InscriptionCoursDto>> getInscriptionsByCours(@PathVariable Long coursId) {
        return ResponseEntity.ok(inscriptionService.getInscriptionsByCours(coursId));
    }

    @GetMapping("/etudiants/{etudiantId}/inscriptions")
    public ResponseEntity<List<InscriptionCoursDto>> getInscriptionsByEtudiant(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(inscriptionService.getInscriptionsByEtudiant(etudiantId));
    }

    @GetMapping("/mes-inscriptions")
    public ResponseEntity<List<InscriptionCoursDto>> getMyInscriptions(Authentication authentication) {
        Etudiant etudiant = resolveEtudiant(authentication);
        return ResponseEntity.ok(inscriptionService.getInscriptionsByEtudiant(etudiant.getId()));
    }

    @GetMapping("/cours/{coursId}/progression")
    public ResponseEntity<InscriptionCoursDto> getProgression(@PathVariable Long coursId,
            @RequestParam Long etudiantId) {
        return ResponseEntity.ok(inscriptionService.getProgression(etudiantId, coursId));
    }

    @PutMapping("/inscriptions/{inscriptionId}/progression")
    public ResponseEntity<InscriptionCoursDto> updateProgression(@PathVariable Long inscriptionId,
            @Valid @RequestBody ProgressionRequest request) {
        return ResponseEntity.ok(inscriptionService.updateProgression(inscriptionId, request));
    }

    @GetMapping("/inscriptions/check-progression")
    public ResponseEntity<Boolean> checkProgression(@RequestParam Long etudiantId,
            @RequestParam Long coursId,
            @RequestParam(defaultValue = "80.0") float seuil) {
        return ResponseEntity.ok(inscriptionService.checkProgressionCondition(etudiantId, coursId, seuil));
    }

    @PutMapping("/inscriptions/{etudiantId}/{coursId}/abandon")
    public ResponseEntity<Void> abandonCours(@PathVariable Long etudiantId, @PathVariable Long coursId) {
        inscriptionService.abandonCours(etudiantId, coursId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/etudiants/{etudiantId}/bulletin")
    public ResponseEntity<BulletinDto> getBulletin(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(bulletinService.generateBulletin(etudiantId));
    }

    @GetMapping("/etudiants/me/bulletin")
    public ResponseEntity<BulletinDto> getMyBulletin(Authentication authentication) {
        Etudiant etudiant = resolveEtudiant(authentication);
        return ResponseEntity.ok(bulletinService.generateBulletin(etudiant.getId()));
    }

    private Etudiant resolveEtudiant(Authentication authentication) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve"));
        return etudiantRepository.findByUtilisateurId(utilisateur.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profil etudiant non trouve"));
    }
}
