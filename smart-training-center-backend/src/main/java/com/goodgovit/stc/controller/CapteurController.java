package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.CapteurIoTDto;
import com.goodgovit.stc.dto.CapteurIoTRequest;
import com.goodgovit.stc.service.CapteurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/capteurs")
@RequiredArgsConstructor
public class CapteurController {

    private final CapteurService capteurService;

    @GetMapping("/{id}")
    public ResponseEntity<CapteurIoTDto> getCapteur(@PathVariable Long id) {
        return ResponseEntity.ok(capteurService.getCapteurById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<CapteurIoTDto> registerCapteur(@Valid @RequestBody CapteurIoTRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(capteurService.registerCapteur(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<CapteurIoTDto> updateCapteur(@PathVariable Long id,
                                                        @Valid @RequestBody CapteurIoTRequest request) {
        return ResponseEntity.ok(capteurService.updateCapteur(id, request));
    }

    @GetMapping("/online")
    public ResponseEntity<List<CapteurIoTDto>> getOnlineCapteurs() {
        return ResponseEntity.ok(capteurService.getOnlineCapteurs());
    }

    @GetMapping("/offline")
    public ResponseEntity<List<CapteurIoTDto>> getOfflineCapteurs() {
        return ResponseEntity.ok(capteurService.getOfflineCapteurs());
    }
}
