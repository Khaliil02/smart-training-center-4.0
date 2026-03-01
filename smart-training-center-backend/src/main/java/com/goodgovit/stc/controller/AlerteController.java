package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.AlerteDto;
import com.goodgovit.stc.service.AlerteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATEUR')")
public class AlerteController {

    private final AlerteService alerteService;

    @GetMapping
    public ResponseEntity<List<AlerteDto>> getActiveAlertes() {
        return ResponseEntity.ok(alerteService.getActiveAlertes());
    }

    @GetMapping("/all")
    public ResponseEntity<List<AlerteDto>> getAllAlertes() {
        return ResponseEntity.ok(alerteService.getAllAlertes());
    }

    @GetMapping("/salle/{salleId}")
    public ResponseEntity<List<AlerteDto>> getAlertesBySalle(@PathVariable Long salleId) {
        return ResponseEntity.ok(alerteService.getAlertesBySalle(salleId));
    }

    @PutMapping("/{id}/traiter")
    public ResponseEntity<AlerteDto> traiterAlerte(@PathVariable Long id) {
        return ResponseEntity.ok(alerteService.traiterAlerte(id));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countActiveAlertes() {
        return ResponseEntity.ok(alerteService.countActiveAlertes());
    }
}
