package com.goodgovit.stc.controller;

import com.goodgovit.stc.dto.CapteurIoTRequest;
import com.goodgovit.stc.dto.IoTDeviceDto;
import com.goodgovit.stc.service.IoTDeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/iot/devices")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRATEUR')")
public class IoTDeviceController {

    private final IoTDeviceService ioTDeviceService;

    @GetMapping
    public ResponseEntity<List<IoTDeviceDto>> getAllDevices() {
        return ResponseEntity.ok(ioTDeviceService.getAllDevices());
    }

    @PostMapping
    public ResponseEntity<IoTDeviceDto> registerDevice(@Valid @RequestBody CapteurIoTRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ioTDeviceService.registerDevice(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IoTDeviceDto> updateDevice(@PathVariable Long id, @Valid @RequestBody CapteurIoTRequest request) {
        return ResponseEntity.ok(ioTDeviceService.updateDevice(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IoTDeviceDto> getDevice(@PathVariable Long id) {
        return ResponseEntity.ok(ioTDeviceService.getDeviceById(id));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<IoTDeviceDto> getDeviceStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ioTDeviceService.getDeviceStatus(id));
    }

    /**
     * Placeholder for OTA firmware update — returns 501 Not Implemented.
     */
    @PostMapping("/{id}/ota")
    public ResponseEntity<Map<String, String>> triggerOta(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(Map.of(
                        "message", "OTA firmware update is not yet implemented",
                        "deviceId", id.toString(),
                        "status", "NOT_IMPLEMENTED"
                ));
    }

    @GetMapping("/fleet/status")
    public ResponseEntity<Map<String, Long>> getFleetStatus() {
        return ResponseEntity.ok(Map.of(
                "online", ioTDeviceService.countOnlineDevices(),
                "offline", ioTDeviceService.countOfflineDevices(),
                "total", ioTDeviceService.countOnlineDevices() + ioTDeviceService.countOfflineDevices()
        ));
    }
}
