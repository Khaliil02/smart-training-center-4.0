package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.InscriptionCours;
import com.goodgovit.stc.entity.enums.EtatInscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InscriptionCoursRepository extends JpaRepository<InscriptionCours, Long> {
    List<InscriptionCours> findByEtudiantId(Long etudiantId);

    List<InscriptionCours> findByCoursId(Long coursId);

    Optional<InscriptionCours> findByEtudiantIdAndCoursId(Long etudiantId, Long coursId);

    List<InscriptionCours> findByEtat(EtatInscription etat);

    long countByCoursId(Long coursId);

    List<InscriptionCours> findByCoursIdIn(List<Long> coursIds);

    long countByEtat(EtatInscription etat);
}
