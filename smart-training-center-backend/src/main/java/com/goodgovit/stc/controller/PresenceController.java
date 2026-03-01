package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.PresenceDto;
import com.goodgovit.stc.dto.ScanRequest;
import com.goodgovit.stc.service.PresenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @PostMapping("/presence/scan")
    public ResponseEntity<PresenceDto> recordScan(@Valid @RequestBody ScanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(presenceService.recordScan(request));
    }

    @GetMapping("/salles/{salleId}/presences")
    public ResponseEntity<List<PresenceDto>> getPresencesBySalle(@PathVariable Long salleId) {
        return ResponseEntity.ok(presenceService.getPresencesBySalle(salleId));
    }

    @GetMapping("/salles/{salleId}/presences/historique")
    public ResponseEntity<List<PresenceDto>> getPresenceHistory(
            @PathVariable Long salleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(presenceService.getPresencesBySalleAndDateRange(salleId, from, to));
    }

    @GetMapping("/etudiants/{etudiantId}/presences")
    public ResponseEntity<List<PresenceDto>> getPresencesByEtudiant(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(presenceService.getPresencesByEtudiant(etudiantId));
    }
}
