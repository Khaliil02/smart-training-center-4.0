package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Presence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PresenceRepository extends JpaRepository<Presence, Long> {
    List<Presence> findByEtudiantId(Long etudiantId);

    List<Presence> findBySalleId(Long salleId);

    List<Presence> findBySalleIdAndDateHeureBetween(Long salleId, LocalDateTime from, LocalDateTime to);

    List<Presence> findByEtudiantIdAndDateHeureBetween(Long etudiantId, LocalDateTime from, LocalDateTime to);

    List<Presence> findTop20ByOrderByDateHeureDesc();

    long countBySalleId(Long salleId);
}
