package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Salle;
import com.goodgovit.stc.entity.enums.TypeSalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long> {
    Optional<Salle> findByNomSalle(String nomSalle);
    List<Salle> findByType(TypeSalle type);
}
