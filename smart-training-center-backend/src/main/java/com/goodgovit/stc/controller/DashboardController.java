package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.entity.Enseignant;
import com.goodgovit.stc.entity.Utilisateur;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.EnseignantRepository;
import com.goodgovit.stc.repository.UtilisateurRepository;
import com.goodgovit.stc.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UtilisateurRepository utilisateurRepository;
    private final EnseignantRepository enseignantRepository;

    @GetMapping("/pedagogique")
    @PreAuthorize("hasAnyRole('ENSEIGNANT', 'ADMINISTRATEUR')")
    public ResponseEntity<DashboardPedagogiqueDto> getPedagogique(@RequestParam String enseignantEmail) {
        // Find user by email
        Utilisateur utilisateur = utilisateurRepository.findByEmail(enseignantEmail)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + enseignantEmail));

        // Find enseignant by user ID — may not exist for admin-only users
        Optional<Enseignant> enseignantOpt = enseignantRepository.findByUtilisateurId(utilisateur.getId());

        if (enseignantOpt.isEmpty()) {
            // User is not an Enseignant (e.g. pure admin) — return empty dashboard
            DashboardPedagogiqueDto empty = DashboardPedagogiqueDto.builder()
                    .enseignantId(0L)
                    .enseignantNom(utilisateur.getNom() + " " + utilisateur.getPrenom())
                    .totalCours(0)
                    .totalEtudiants(0)
                    .coursStats(Collections.emptyList())
                    .build();
            return ResponseEntity.ok(empty);
        }

        return ResponseEntity.ok(dashboardService.getPedagogique(enseignantOpt.get().getId()));
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
