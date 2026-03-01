package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.RfidQr;
import com.goodgovit.stc.entity.enums.StatutBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface RfidQrRepository extends JpaRepository<RfidQr, Long> {
    Optional<RfidQr> findByCodeQR(String codeQR);
    Optional<RfidQr> findByEtudiantId(Long etudiantId);
    List<RfidQr> findByStatut(StatutBadge statut);
}
