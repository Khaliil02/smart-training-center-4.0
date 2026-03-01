package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Utilisateur;
import com.goodgovit.stc.entity.enums.EtatCompte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Utilisateur> findByEtatCompte(EtatCompte etatCompte);
}
