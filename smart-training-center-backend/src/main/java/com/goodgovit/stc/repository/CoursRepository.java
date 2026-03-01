package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Cours;
import com.goodgovit.stc.entity.enums.StatutCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CoursRepository extends JpaRepository<Cours, Long> {
    List<Cours> findByEnseignantId(Long enseignantId);
    List<Cours> findByStatut(StatutCours statut);
    List<Cours> findBySalleId(Long salleId);
    List<Cours> findByEstActifTrue();
}
