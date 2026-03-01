package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnseignantRepository extends JpaRepository<Enseignant, Long> {
    Optional<Enseignant> findByUtilisateurId(Long utilisateurId);
    List<Enseignant> findByResponsableAcademiqueId(Long responsableId);
}
