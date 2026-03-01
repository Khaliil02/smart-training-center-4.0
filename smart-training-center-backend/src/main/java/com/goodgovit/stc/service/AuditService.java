package com.goodgovit.stc.service;

import com.goodgovit.stc.entity.AuditLog;
import com.goodgovit.stc.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String action, String entityType, Long entityId, Long userId, String details) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .userId(userId)
                .details(details)
                .build();

        auditLogRepository.save(auditLog);
        log.debug("Audit: {} on {} [{}] by user {}", action, entityType, entityId, userId);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> findAll(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> findByUserId(Long userId) {
        return auditLogRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> findByEntityType(String entityType) {
        return auditLogRepository.findByEntityType(entityType);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> findByDateRange(LocalDateTime from, LocalDateTime to) {
        return auditLogRepository.findByTimestampBetween(from, to);
    }
}
