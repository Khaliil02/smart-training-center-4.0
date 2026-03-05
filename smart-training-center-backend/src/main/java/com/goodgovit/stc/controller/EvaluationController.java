package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.entity.Etudiant;
import com.goodgovit.stc.entity.Utilisateur;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.EtudiantRepository;
import com.goodgovit.stc.repository.UtilisateurRepository;
import com.goodgovit.stc.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final UtilisateurRepository utilisateurRepository;
    private final EtudiantRepository etudiantRepository;

    @GetMapping
    public ResponseEntity<List<EvaluationDto>> getAllEvaluations() {
        return ResponseEntity.ok(evaluationService.getAllEvaluations());
    }

    @GetMapping("/cours/{coursId}")
    public ResponseEntity<List<EvaluationDto>> getEvaluationsByCours(@PathVariable Long coursId) {
        return ResponseEntity.ok(evaluationService.getEvaluationsByCours(coursId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationDto> getEvaluation(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.getEvaluationById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<EvaluationDto> createEvaluation(@Valid @RequestBody EvaluationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.createEvaluation(request));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<EvaluationDto> publishEvaluation(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.publishEvaluation(id));
    }

    // ── Quiz endpoints ──

    @GetMapping("/quizzes/cours/{coursId}")
    public ResponseEntity<List<QuizDto>> getQuizzesByCours(@PathVariable Long coursId) {
        return ResponseEntity.ok(evaluationService.getQuizzesByCours(coursId));
    }

    @GetMapping("/quizzes/{id}")
    public ResponseEntity<QuizDto> getQuiz(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.getQuizById(id));
    }

    @PostMapping("/quizzes")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<QuizDto> createQuiz(@Valid @RequestBody QuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.createQuiz(request));
    }

    @PostMapping("/quizzes/submit")
    public ResponseEntity<QuizResultDto> submitQuiz(@Valid @RequestBody QuizSubmissionRequest request) {
        return ResponseEntity.ok(evaluationService.submitQuiz(request));
    }

    // ── Quiz by Evaluation endpoints (used by frontend) ──

    @GetMapping("/{id}/quiz")
    public ResponseEntity<QuizDto> getQuizByEvaluation(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.getQuizByEvaluationId(id));
    }

    @PostMapping("/{id}/quiz/submit")
    public ResponseEntity<QuizResultDto> submitQuizByEvaluation(@PathVariable Long id,
                                                                  @RequestBody QuizSubmissionRequest request,
                                                                  Authentication authentication) {
        // Resolve etudiant from auth context if etudiantId is 0
        if (request.getEtudiantId() == null || request.getEtudiantId() == 0) {
            Utilisateur utilisateur = utilisateurRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve"));
            Etudiant etudiant = etudiantRepository.findByUtilisateurId(utilisateur.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Profil etudiant non trouve"));
            request.setEtudiantId(etudiant.getId());
        }
        return ResponseEntity.ok(evaluationService.submitQuiz(request));
    }
}
