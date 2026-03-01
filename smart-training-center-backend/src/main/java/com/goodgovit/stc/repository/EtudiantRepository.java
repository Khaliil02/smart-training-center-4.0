package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByMatricule(String matricule);
    Optional<Etudiant> findByUtilisateurId(Long utilisateurId);
}
