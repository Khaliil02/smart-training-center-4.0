package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.service.CapteurService;
import com.goodgovit.stc.service.PresenceService;
import com.goodgovit.stc.service.SalleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/salles")
@RequiredArgsConstructor
public class SalleController {

    private final SalleService salleService;
    private final CapteurService capteurService;
    private final PresenceService presenceService;

    @GetMapping
    public ResponseEntity<List<SalleDto>> getAllSalles() {
        return ResponseEntity.ok(salleService.getAllSalles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalleDto> getSalle(@PathVariable Long id) {
        return ResponseEntity.ok(salleService.getSalleById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<SalleDto> createSalle(@Valid @RequestBody SalleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salleService.createSalle(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<SalleDto> updateSalle(@PathVariable Long id, @Valid @RequestBody SalleRequest request) {
        return ResponseEntity.ok(salleService.updateSalle(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> deleteSalle(@PathVariable Long id) {
        salleService.deleteSalle(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/capteurs")
    public ResponseEntity<List<CapteurIoTDto>> getCapteursBySalle(@PathVariable Long id) {
        return ResponseEntity.ok(capteurService.getCapteursBySalle(id));
    }

    @GetMapping("/{id}/environnement")
    public ResponseEntity<EnvironnementDto> getEnvironnement(@PathVariable Long id) {
        return ResponseEntity.ok(capteurService.getEnvironnement(id));
    }

    @GetMapping("/{id}/environnement/historique")
    public ResponseEntity<List<CapteurIoTDto>> getEnvironnementHistorique(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(capteurService.getCapteursBySalle(id));
    }

    @GetMapping("/{id}/presences")
    public ResponseEntity<List<PresenceDto>> getPresencesBySalle(@PathVariable Long id) {
        return ResponseEntity.ok(presenceService.getPresencesBySalle(id));
    }
}
