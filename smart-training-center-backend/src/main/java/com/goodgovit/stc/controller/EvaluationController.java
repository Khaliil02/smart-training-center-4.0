package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

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
}
