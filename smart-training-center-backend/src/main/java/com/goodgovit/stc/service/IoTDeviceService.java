package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.CapteurIoTRequest;
import com.goodgovit.stc.dto.DeviceHeartbeatDto;
import com.goodgovit.stc.dto.IoTDeviceDto;
import com.goodgovit.stc.entity.CapteurIoT;
import com.goodgovit.stc.entity.DeviceHeartbeat;
import com.goodgovit.stc.entity.Salle;
import com.goodgovit.stc.entity.enums.SourceDonnee;
import com.goodgovit.stc.entity.enums.TypeCapteur;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.CapteurIoTRepository;
import com.goodgovit.stc.repository.DeviceHeartbeatRepository;
import com.goodgovit.stc.repository.SalleRepository;
import com.goodgovit.stc.websocket.WebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IoTDeviceService {

    private final CapteurIoTRepository capteurRepository;
    private final DeviceHeartbeatRepository heartbeatRepository;
    private final SalleRepository salleRepository;
    private final AlerteService alerteService;
    private final WebSocketHandler webSocketHandler;

    @Value("${stc.iot.heartbeat-timeout:60}")
    private int heartbeatTimeoutSeconds;

    @Transactional(readOnly = true)
    public List<IoTDeviceDto> getAllDevices() {
        return capteurRepository.findAll().stream()
                .map(this::toDeviceDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IoTDeviceDto getDeviceById(Long id) {
        CapteurIoT capteur = capteurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appareil IoT non trouvé avec l'id: " + id));
        return toDeviceDto(capteur);
    }

    @Transactional(readOnly = true)
    public IoTDeviceDto getDeviceStatus(Long id) {
        return getDeviceById(id);
    }

    @Transactional
    public IoTDeviceDto registerDevice(CapteurIoTRequest request) {
        Salle salle = salleRepository.findById(request.getSalleId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + request.getSalleId()));

        CapteurIoT capteur = CapteurIoT.builder()
                .type(TypeCapteur.valueOf(request.getType()))
                .adresseMac(request.getAdresseMac())
                .firmwareVersion(request.getFirmwareVersion())
                .salle(salle)
                .build();

        return toDeviceDto(capteurRepository.save(capteur));
    }

    @Transactional
    public IoTDeviceDto updateDevice(Long id, CapteurIoTRequest request) {
        CapteurIoT capteur = capteurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appareil IoT non trouvé avec l'id: " + id));

        Salle salle = salleRepository.findById(request.getSalleId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle non trouvée avec l'id: " + request.getSalleId()));

        capteur.setType(TypeCapteur.valueOf(request.getType()));
        capteur.setAdresseMac(request.getAdresseMac());
        capteur.setFirmwareVersion(request.getFirmwareVersion());
        capteur.setSalle(salle);

        return toDeviceDto(capteurRepository.save(capteur));
    }

    /**
     * Record a heartbeat from a device.
     */
    @Transactional
    public void recordHeartbeat(String deviceId, long uptime, long freeMemory) {
        DeviceHeartbeat heartbeat = DeviceHeartbeat.builder()
                .deviceId(deviceId)
                .uptime(uptime)
                .freeMemory(freeMemory)
                .timestamp(LocalDateTime.now())
                .build();

        // Try to link heartbeat to a capteur by deviceId (treating it as MAC or a lookup key)
        capteurRepository.findByAdresseMac(deviceId).ifPresent(capteur -> {
            heartbeat.setCapteur(capteur);
            capteur.setEstEnLigne(true);
            capteurRepository.save(capteur);
        });

        heartbeatRepository.save(heartbeat);
        log.debug("Heartbeat recorded for device: {} (uptime: {}s, free mem: {} bytes)", deviceId, uptime, freeMemory);
    }

    /**
     * Update device online/offline status based on a device status message.
     */
    @Transactional
    public void updateDeviceStatus(String deviceId, boolean online, String firmware, String mac) {
        CapteurIoT capteur = capteurRepository.findByAdresseMac(mac != null ? mac : deviceId)
                .orElse(null);

        if (capteur != null) {
            capteur.setEstEnLigne(online);
            if (firmware != null) {
                capteur.setFirmwareVersion(firmware);
            }
            capteurRepository.save(capteur);

            webSocketHandler.pushDeviceStatus(deviceId, online);

            if (!online) {
                alerteService.createDeviceOfflineAlert(capteur.getId(), SourceDonnee.HARDWARE);
            }
        } else {
            log.warn("Device status received for unknown device: {} (mac: {})", deviceId, mac);
        }
    }

    /**
     * Scheduled task to check for devices that haven't sent a heartbeat within the timeout.
     * Runs every 30 seconds.
     */
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void checkDeviceTimeouts() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(heartbeatTimeoutSeconds);
        List<CapteurIoT> onlineDevices = capteurRepository.findByEstEnLigne(true);

        for (CapteurIoT capteur : onlineDevices) {
            DeviceHeartbeat lastHeartbeat = heartbeatRepository
                    .findTopByDeviceIdOrderByTimestampDesc(capteur.getAdresseMac())
                    .orElse(null);

            if (lastHeartbeat != null && lastHeartbeat.getTimestamp().isBefore(cutoff)) {
                capteur.setEstEnLigne(false);
                capteurRepository.save(capteur);
                webSocketHandler.pushDeviceStatus(capteur.getAdresseMac(), false);
                alerteService.createDeviceOfflineAlert(capteur.getId(), SourceDonnee.HARDWARE);
                log.warn("Device {} marked OFFLINE (no heartbeat since {})", capteur.getAdresseMac(), lastHeartbeat.getTimestamp());
            }
        }
    }

    @Transactional(readOnly = true)
    public long countOnlineDevices() {
        return capteurRepository.findByEstEnLigne(true).size();
    }

    @Transactional(readOnly = true)
    public long countOfflineDevices() {
        return capteurRepository.findByEstEnLigne(false).size();
    }

    private IoTDeviceDto toDeviceDto(CapteurIoT c) {
        DeviceHeartbeatDto lastHb = null;
        if (c.getAdresseMac() != null) {
            DeviceHeartbeat hb = heartbeatRepository
                    .findTopByDeviceIdOrderByTimestampDesc(c.getAdresseMac())
                    .orElse(null);
            if (hb != null) {
                lastHb = DeviceHeartbeatDto.builder()
                        .id(hb.getId())
                        .deviceId(hb.getDeviceId())
                        .uptime(hb.getUptime())
                        .freeMemory(hb.getFreeMemory())
                        .timestamp(hb.getTimestamp())
                        .build();
            }
        }

        return IoTDeviceDto.builder()
                .id(c.getId())
                .type(c.getType().name())
                .adresseMac(c.getAdresseMac())
                .firmwareVersion(c.getFirmwareVersion())
                .estEnLigne(c.isEstEnLigne())
                .valeurMesuree(c.getValeurMesuree())
                .dateHeureMesure(c.getDateHeureMesure())
                .salleId(c.getSalle().getId())
                .salleNom(c.getSalle().getNomSalle())
                .lastHeartbeat(lastHb)
                .build();
    }
}
