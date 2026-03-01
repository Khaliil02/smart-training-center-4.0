package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MatiereRepository extends JpaRepository<Matiere, Long> {
    List<Matiere> findBySpecialiteId(Long specialiteId);
}
