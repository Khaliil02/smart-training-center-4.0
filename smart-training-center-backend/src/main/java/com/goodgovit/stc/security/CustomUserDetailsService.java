package com.goodgovit.stc.security;

import com.goodgovit.stc.entity.Utilisateur;
import com.goodgovit.stc.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Utilisateur non trouvé avec l'email: " + email));

        var authorities = utilisateur.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getNomRole()))
                .collect(Collectors.toSet());

        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasse(),
                utilisateur.getEtatCompte().name().equals("ACTIF"),
                true, true, true,
                authorities
        );
    }
}
