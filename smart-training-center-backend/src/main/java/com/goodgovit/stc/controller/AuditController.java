package com.goodgovit.stc.controller;

import com.goodgovit.stc.entity.AuditLog;
import com.goodgovit.stc.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRATEUR', 'RESPONSABLE_ACADEMIQUE')")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(auditService.findAll(pageable));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(auditService.findByUserId(userId));
    }

    @GetMapping("/entity/{entityType}")
    public ResponseEntity<List<AuditLog>> getByEntityType(@PathVariable String entityType) {
        return ResponseEntity.ok(auditService.findByEntityType(entityType));
    }

    @GetMapping("/range")
    public ResponseEntity<List<AuditLog>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(auditService.findByDateRange(from, to));
    }
}
