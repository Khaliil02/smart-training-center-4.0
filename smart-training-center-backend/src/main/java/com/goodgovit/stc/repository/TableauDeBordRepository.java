package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.TableauDeBord;
import com.goodgovit.stc.entity.enums.TypeDashboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TableauDeBordRepository extends JpaRepository<TableauDeBord, Long> {
    List<TableauDeBord> findByType(TypeDashboard type);
}
