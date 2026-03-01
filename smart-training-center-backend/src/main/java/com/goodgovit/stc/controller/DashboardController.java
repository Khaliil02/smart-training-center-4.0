package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/pedagogique")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<DashboardPedagogiqueDto> getPedagogique(@RequestParam Long enseignantId) {
        return ResponseEntity.ok(dashboardService.getPedagogique(enseignantId));
    }

    @GetMapping("/administratif")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<DashboardAdministratifDto> getAdministratif() {
        return ResponseEntity.ok(dashboardService.getAdministratif());
    }

    @GetMapping("/decisionnel")
    @PreAuthorize("hasAnyRole('RESPONSABLE_ACADEMIQUE', 'ADMINISTRATEUR')")
    public ResponseEntity<DashboardDecisionnelDto> getDecisionnel() {
        return ResponseEntity.ok(dashboardService.getDecisionnel());
    }

    @GetMapping("/iot")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<DashboardIoTDto> getIoT(@RequestParam Long salleId) {
        return ResponseEntity.ok(dashboardService.getIoT(salleId));
    }

    @GetMapping("/iot/fleet")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<FleetStatusDto> getFleetStatus() {
        return ResponseEntity.ok(dashboardService.getFleetStatus());
    }

    @GetMapping("/performance")
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'RESPONSABLE_ACADEMIQUE')")
    public ResponseEntity<PerformanceDto> getPerformance() {
        return ResponseEntity.ok(dashboardService.getPerformance());
    }
}
