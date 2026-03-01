package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.service.CatalogueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogue")
@RequiredArgsConstructor
public class CatalogueController {

    private final CatalogueService catalogueService;

    // ── Filieres ──

    @GetMapping("/filieres")
    public ResponseEntity<List<FiliereDto>> getAllFilieres() {
        return ResponseEntity.ok(catalogueService.getAllFilieres());
    }

    @GetMapping("/filieres/{id}")
    public ResponseEntity<FiliereDto> getFiliere(@PathVariable Long id) {
        return ResponseEntity.ok(catalogueService.getFiliereById(id));
    }

    @PostMapping("/filieres")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<FiliereDto> createFiliere(@Valid @RequestBody FiliereRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogueService.createFiliere(request));
    }

    @PutMapping("/filieres/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<FiliereDto> updateFiliere(@PathVariable Long id, @Valid @RequestBody FiliereRequest request) {
        return ResponseEntity.ok(catalogueService.updateFiliere(id, request));
    }

    @DeleteMapping("/filieres/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteFiliere(@PathVariable Long id) {
        catalogueService.deleteFiliere(id);
        return ResponseEntity.noContent().build();
    }

    // ── Specialites ──

    @GetMapping("/specialites")
    public ResponseEntity<List<SpecialiteDto>> getAllSpecialites() {
        return ResponseEntity.ok(catalogueService.getAllSpecialites());
    }

    @GetMapping("/specialites/filiere/{filiereId}")
    public ResponseEntity<List<SpecialiteDto>> getSpecialitesByFiliere(@PathVariable Long filiereId) {
        return ResponseEntity.ok(catalogueService.getSpecialitesByFiliere(filiereId));
    }

    @GetMapping("/specialites/{id}")
    public ResponseEntity<SpecialiteDto> getSpecialite(@PathVariable Long id) {
        return ResponseEntity.ok(catalogueService.getSpecialiteById(id));
    }

    @PostMapping("/specialites")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<SpecialiteDto> createSpecialite(@Valid @RequestBody SpecialiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogueService.createSpecialite(request));
    }

    @PutMapping("/specialites/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<SpecialiteDto> updateSpecialite(@PathVariable Long id, @Valid @RequestBody SpecialiteRequest request) {
        return ResponseEntity.ok(catalogueService.updateSpecialite(id, request));
    }

    @DeleteMapping("/specialites/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteSpecialite(@PathVariable Long id) {
        catalogueService.deleteSpecialite(id);
        return ResponseEntity.noContent().build();
    }

    // ── Matieres ──

    @GetMapping("/matieres")
    public ResponseEntity<List<MatiereDto>> getAllMatieres() {
        return ResponseEntity.ok(catalogueService.getAllMatieres());
    }

    @GetMapping("/matieres/specialite/{specialiteId}")
    public ResponseEntity<List<MatiereDto>> getMatieresBySpecialite(@PathVariable Long specialiteId) {
        return ResponseEntity.ok(catalogueService.getMatieresBySpecialite(specialiteId));
    }

    @GetMapping("/matieres/{id}")
    public ResponseEntity<MatiereDto> getMatiere(@PathVariable Long id) {
        return ResponseEntity.ok(catalogueService.getMatiereById(id));
    }

    @PostMapping("/matieres")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<MatiereDto> createMatiere(@Valid @RequestBody MatiereRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogueService.createMatiere(request));
    }

    @PutMapping("/matieres/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<MatiereDto> updateMatiere(@PathVariable Long id, @Valid @RequestBody MatiereRequest request) {
        return ResponseEntity.ok(catalogueService.updateMatiere(id, request));
    }

    @DeleteMapping("/matieres/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteMatiere(@PathVariable Long id) {
        catalogueService.deleteMatiere(id);
        return ResponseEntity.noContent().build();
    }

    // ── Certifications ──

    @GetMapping("/certifications")
    public ResponseEntity<List<CertificationDto>> getAllCertifications() {
        return ResponseEntity.ok(catalogueService.getAllCertifications());
    }

    @GetMapping("/certifications/{id}")
    public ResponseEntity<CertificationDto> getCertification(@PathVariable Long id) {
        return ResponseEntity.ok(catalogueService.getCertificationById(id));
    }

    @PostMapping("/certifications")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<CertificationDto> createCertification(@Valid @RequestBody CertificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogueService.createCertification(request));
    }

    @PutMapping("/certifications/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<CertificationDto> updateCertification(@PathVariable Long id, @Valid @RequestBody CertificationRequest request) {
        return ResponseEntity.ok(catalogueService.updateCertification(id, request));
    }

    @DeleteMapping("/certifications/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteCertification(@PathVariable Long id) {
        catalogueService.deleteCertification(id);
        return ResponseEntity.noContent().build();
    }
}
