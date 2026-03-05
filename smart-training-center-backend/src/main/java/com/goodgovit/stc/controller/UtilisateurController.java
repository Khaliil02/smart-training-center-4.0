package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.UtilisateurDto;
import com.goodgovit.stc.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<UtilisateurDto>> getAll() {
        return ResponseEntity.ok(utilisateurService.getAllUtilisateurs());
    }

    @GetMapping("/me")
    public ResponseEntity<UtilisateurDto> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(utilisateurService.getUtilisateurByEmail(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UtilisateurDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.getUtilisateurById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UtilisateurDto> update(@PathVariable Long id, @RequestBody UtilisateurDto dto) {
        return ResponseEntity.ok(utilisateurService.updateUtilisateur(id, dto));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(Authentication authentication,
            @RequestBody Map<String, String> payload) {
        utilisateurService.changePassword(
                authentication.getName(),
                payload.get("oldPassword"),
                payload.get("newPassword"));
        return ResponseEntity.ok().build();
    }
}
