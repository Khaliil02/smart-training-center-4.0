package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.ResponsableAcademique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ResponsableAcademiqueRepository extends JpaRepository<ResponsableAcademique, Long> {
    Optional<ResponsableAcademique> findByUtilisateurId(Long utilisateurId);
}
