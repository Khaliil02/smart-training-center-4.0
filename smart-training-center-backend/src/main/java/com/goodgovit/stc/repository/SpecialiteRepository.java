package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SpecialiteRepository extends JpaRepository<Specialite, Long> {
    List<Specialite> findByFiliereId(Long filiereId);
}
