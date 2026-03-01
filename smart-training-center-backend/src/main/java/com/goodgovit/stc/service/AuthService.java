package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.AuthResponse;
import com.goodgovit.stc.dto.LoginRequest;
import com.goodgovit.stc.dto.RegisterRequest;
import com.goodgovit.stc.entity.Role;
import com.goodgovit.stc.entity.Utilisateur;
import com.goodgovit.stc.entity.enums.EtatCompte;
import com.goodgovit.stc.exception.BadRequestException;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.RoleRepository;
import com.goodgovit.stc.repository.UtilisateurRepository;
import com.goodgovit.stc.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        auditService.log("LOGIN", "Utilisateur", utilisateur.getId(), utilisateur.getId(), "Connexion réussie");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .type("Bearer")
                .userId(utilisateur.getId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .roles(roles)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Un compte avec cet email existe déjà");
        }

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByNomRole(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Rôle non trouvé: " + roleName));
                roles.add(role);
            }
        } else {
            Role defaultRole = roleRepository.findByNomRole("ETUDIANT")
                    .orElseThrow(() -> new ResourceNotFoundException("Rôle ETUDIANT non trouvé"));
            roles.add(defaultRole);
        }

        Utilisateur utilisateur = Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .etatCompte(EtatCompte.ACTIF)
                .roles(roles)
                .build();

        utilisateurRepository.save(utilisateur);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse()));

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);

        Set<String> roleNames = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        auditService.log("REGISTER", "Utilisateur", utilisateur.getId(), utilisateur.getId(), "Inscription réussie");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .type("Bearer")
                .userId(utilisateur.getId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .roles(roleNames)
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Refresh token invalide ou expiré");
        }

        String email = jwtTokenProvider.getUsernameFromToken(refreshToken);

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        String roles = utilisateur.getRoles().stream()
                .map(role -> "ROLE_" + role.getNomRole())
                .collect(Collectors.joining(","));

        String newAccessToken = jwtTokenProvider.generateAccessTokenFromEmail(email, roles);

        Set<String> roleNames = utilisateur.getRoles().stream()
                .map(role -> "ROLE_" + role.getNomRole())
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .type("Bearer")
                .userId(utilisateur.getId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .roles(roleNames)
                .build();
    }
}
