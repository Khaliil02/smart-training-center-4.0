package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.UtilisateurDto;
import com.goodgovit.stc.entity.Role;
import com.goodgovit.stc.entity.Utilisateur;
import com.goodgovit.stc.entity.enums.EtatCompte;
import com.goodgovit.stc.exception.BadRequestException;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UtilisateurDto> getAllUtilisateurs() {
        return utilisateurRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UtilisateurDto getUtilisateurById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public UtilisateurDto getUtilisateurByEmail(String email) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'email: " + email));
        return toDto(user);
    }

    @Transactional
    public UtilisateurDto updateUtilisateur(Long id, UtilisateurDto dto) {
        Utilisateur user = findOrThrow(id);
        user.setNom(dto.getNom());
        user.setPrenom(dto.getPrenom());
        user.setEmail(dto.getEmail());
        if (dto.getEtatCompte() != null) {
            user.setEtatCompte(EtatCompte.valueOf(dto.getEtatCompte()));
        }
        return toDto(utilisateurRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, String oldPassword, String newPassword) {
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        if (!passwordEncoder.matches(oldPassword, user.getMotDePasse())) {
            throw new BadRequestException("Ancien mot de passe incorrect");
        }
        user.setMotDePasse(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(user);
    }

    private Utilisateur findOrThrow(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'id: " + id));
    }

    private UtilisateurDto toDto(Utilisateur u) {
        return UtilisateurDto.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .dateInscription(u.getDateInscription())
                .etatCompte(u.getEtatCompte().name())
                .roles(u.getRoles().stream().map(Role::getNomRole).collect(Collectors.toList()))
                .build();
    }
}
