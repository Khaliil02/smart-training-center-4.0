package com.goodgovit.stc.repository;

import com.goodgovit.stc.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(Long userId);
    List<AuditLog> findByEntityType(String entityType);
    List<AuditLog> findByTimestampBetween(LocalDateTime from, LocalDateTime to);
}
