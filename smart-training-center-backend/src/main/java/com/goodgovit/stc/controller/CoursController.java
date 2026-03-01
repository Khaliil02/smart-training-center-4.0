package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.CoursDto;
import com.goodgovit.stc.dto.CoursRequest;
import com.goodgovit.stc.service.CoursService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cours")
@RequiredArgsConstructor
public class CoursController {

    private final CoursService coursService;

    @GetMapping
    public ResponseEntity<Page<CoursDto>> getAllCours(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(coursService.getAllCours(pageable));
    }

    @GetMapping("/active")
    public ResponseEntity<List<CoursDto>> getActiveCours() {
        return ResponseEntity.ok(coursService.getActiveCours());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoursDto> getCours(@PathVariable Long id) {
        return ResponseEntity.ok(coursService.getCoursById(id));
    }

    @GetMapping("/enseignant/{enseignantId}")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<List<CoursDto>> getCoursByEnseignant(@PathVariable Long enseignantId) {
        return ResponseEntity.ok(coursService.getCoursByEnseignant(enseignantId));
    }

    @PostMapping("/{enseignantId}")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<CoursDto> createCours(@PathVariable Long enseignantId,
                                                 @Valid @RequestBody CoursRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(coursService.createCours(request, enseignantId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<CoursDto> updateCours(@PathVariable Long id,
                                                 @Valid @RequestBody CoursRequest request) {
        return ResponseEntity.ok(coursService.updateCours(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteCours(@PathVariable Long id) {
        coursService.deleteCours(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('RESPONSABLE_ACADEMIQUE', 'ADMINISTRATEUR')")
    public ResponseEntity<CoursDto> approveCours(@PathVariable Long id) {
        return ResponseEntity.ok(coursService.approveCours(id));
    }

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<CoursDto> archiveCours(@PathVariable Long id) {
        return ResponseEntity.ok(coursService.archiveCours(id));
    }
}
