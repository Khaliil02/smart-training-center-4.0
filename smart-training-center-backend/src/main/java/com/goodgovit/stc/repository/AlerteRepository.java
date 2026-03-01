package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Alerte;
import com.goodgovit.stc.entity.enums.StatutAlerte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlerteRepository extends JpaRepository<Alerte, Long> {
    List<Alerte> findByStatut(StatutAlerte statut);
    List<Alerte> findBySalleId(Long salleId);
    long countByStatut(StatutAlerte statut);
}
