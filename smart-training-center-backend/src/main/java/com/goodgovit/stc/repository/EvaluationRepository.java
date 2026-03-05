package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.Evaluation;
import com.goodgovit.stc.entity.enums.StatutEvaluation;
import com.goodgovit.stc.entity.enums.TypeEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByCoursId(Long coursId);

    List<Evaluation> findByStatut(StatutEvaluation statut);

    List<Evaluation> findByType(TypeEvaluation type);

    List<Evaluation> findByCoursIdIn(List<Long> coursIds);
}
