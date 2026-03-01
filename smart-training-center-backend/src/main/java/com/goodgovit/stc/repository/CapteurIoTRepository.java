package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.CapteurIoT;
import com.goodgovit.stc.entity.enums.TypeCapteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CapteurIoTRepository extends JpaRepository<CapteurIoT, Long> {
    List<CapteurIoT> findBySalleId(Long salleId);
    List<CapteurIoT> findByType(TypeCapteur type);
    List<CapteurIoT> findByEstEnLigne(boolean estEnLigne);
    Optional<CapteurIoT> findByAdresseMac(String adresseMac);
}
