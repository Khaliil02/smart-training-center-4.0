package com.goodgovit.stc.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.entity.CapteurIoT;
import com.goodgovit.stc.entity.enums.SourceDonnee;
import com.goodgovit.stc.repository.CapteurIoTRepository;
import com.goodgovit.stc.service.AlerteService;
import com.goodgovit.stc.service.CapteurService;
import com.goodgovit.stc.service.IoTDeviceService;
import com.goodgovit.stc.service.PresenceService;
import com.goodgovit.stc.websocket.WebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class MqttMessageHandler {

    private final ObjectMapper objectMapper;
    private final CapteurService capteurService;
    private final AlerteService alerteService;
    private final PresenceService presenceService;
    private final IoTDeviceService ioTDeviceService;
    private final CapteurIoTRepository capteurRepository;
    private final WebSocketHandler webSocketHandler;

    /**
     * Main entry point for processing an MQTT message.
     * Routes the message based on the topic pattern.
     */
    public void handleMessage(String topic, String payload) {
        log.debug("MQTT message received - topic: {}, payload: {}", topic, payload);

        try {
            String messageType = MqttPayloadSchemas.extractMessageType(topic);
            if (messageType == null) {
                log.warn("Could not determine message type from topic: {}", topic);
                return;
            }

            switch (messageType) {
                case "temperature":
                    handleTemperature(topic, payload);
                    break;
                case "co2":
                    handleCo2(topic, payload);
                    break;
                case "presence":
                    handlePresence(topic, payload);
                    break;
                case "scan":
                    handleRfidScan(topic, payload);
                    break;
                case "status":
                    handleDeviceStatus(payload);
                    break;
                case "heartbeat":
                    handleHeartbeat(payload);
                    break;
                default:
                    log.warn("Unknown message type: {} from topic: {}", messageType, topic);
            }
        } catch (Exception e) {
            log.error("Error processing MQTT message from topic {}: {}", topic, e.getMessage(), e);
        }
    }

    private void handleTemperature(String topic, String payload) throws Exception {
        TemperaturePayload data = objectMapper.readValue(payload, TemperaturePayload.class);
        Long salleId = MqttPayloadSchemas.extractSalleId(topic);

        if (salleId == null) {
            log.warn("Could not extract salle ID from topic: {}", topic);
            return;
        }

        // Update sensor reading and get the entity back (avoids duplicate MAC lookup)
        CapteurIoT capteur = updateSensorBySensorId(data.getSensorId(), data.getValue());
        Long capteurId = capteur != null ? capteur.getId() : null;

        // Check threshold and create alert if needed
        SourceDonnee source = determineSource(data.getSensorId());
        alerteService.checkTemperatureThreshold(salleId, capteurId, data.getValue(), source);

        // Push real-time data via WebSocket
        EnvironnementDto env = capteurService.getEnvironnement(salleId);
        webSocketHandler.pushSensorData(salleId, env);

        log.info("Temperature processed: salle={}, value={}°C", salleId, data.getValue());
    }

    private void handleCo2(String topic, String payload) throws Exception {
        Co2Payload data = objectMapper.readValue(payload, Co2Payload.class);
        Long salleId = MqttPayloadSchemas.extractSalleId(topic);

        if (salleId == null) {
            log.warn("Could not extract salle ID from topic: {}", topic);
            return;
        }

        CapteurIoT capteur = updateSensorBySensorId(data.getSensorId(), data.getValue());
        Long capteurId = capteur != null ? capteur.getId() : null;

        SourceDonnee source = determineSource(data.getSensorId());
        alerteService.checkCo2Threshold(salleId, capteurId, data.getValue(), source);

        EnvironnementDto env = capteurService.getEnvironnement(salleId);
        webSocketHandler.pushSensorData(salleId, env);

        log.info("CO2 processed: salle={}, value={} ppm", salleId, data.getValue());
    }

    private void handlePresence(String topic, String payload) throws Exception {
        PresencePayload data = objectMapper.readValue(payload, PresencePayload.class);
        Long salleId = MqttPayloadSchemas.extractSalleId(topic);

        if (salleId == null) {
            log.warn("Could not extract salle ID from topic: {}", topic);
            return;
        }

        updateSensorBySensorId(data.getSensorId(), data.getCount());

        EnvironnementDto env = capteurService.getEnvironnement(salleId);
        webSocketHandler.pushSensorData(salleId, env);

        log.info("Presence processed: salle={}, count={}, detected={}", salleId, data.getCount(), data.isDetected());
    }

    private void handleRfidScan(String topic, String payload) throws Exception {
        RfidScanPayload data = objectMapper.readValue(payload, RfidScanPayload.class);

        // The readerId from the topic can be used to determine the salle
        // For simplicity, we try to find the RFID reader device and get its salle
        CapteurIoT reader = findCapteurBySensorId(data.getReaderId());
        Long salleId = reader != null ? reader.getSalle().getId() : null;

        if (salleId == null) {
            log.warn("Could not determine salle for RFID reader: {}", data.getReaderId());
            return;
        }

        SourceDonnee source = determineSource(data.getReaderId());
        presenceService.recordRfidScan(data.getBadgeCode(), salleId, source);

        log.info("RFID scan processed: badge={}, reader={}, salle={}", data.getBadgeCode(), data.getReaderId(),
                salleId);
    }

    private void handleDeviceStatus(String payload) throws Exception {
        DeviceStatusPayload data = objectMapper.readValue(payload, DeviceStatusPayload.class);
        boolean online = "ONLINE".equalsIgnoreCase(data.getStatus());
        ioTDeviceService.updateDeviceStatus(data.getDeviceId(), online, data.getFirmware(), data.getMac());

        log.info("Device status processed: device={}, status={}", data.getDeviceId(), data.getStatus());
    }

    private void handleHeartbeat(String payload) throws Exception {
        DeviceHeartbeatPayload data = objectMapper.readValue(payload, DeviceHeartbeatPayload.class);
        ioTDeviceService.recordHeartbeat(data.getDeviceId(), data.getUptime(), data.getFreeMemory());

        log.debug("Heartbeat processed: device={}, uptime={}s", data.getDeviceId(), data.getUptime());
    }

    /**
     * Update sensor reading by sensorId (which is the MAC address of the device).
     * Returns the updated CapteurIoT entity to avoid duplicate lookups.
     */
    private CapteurIoT updateSensorBySensorId(String sensorId, float value) {
        if (sensorId != null) {
            return capteurService.updateSensorReadingByMac(sensorId, value);
        }
        return null;
    }

    /**
     * Find a CapteurIoT by its sensorId (MAC address).
     */
    private CapteurIoT findCapteurBySensorId(String sensorId) {
        if (sensorId == null)
            return null;
        return capteurRepository.findByAdresseMac(sensorId).orElse(null);
    }

    /**
     * Determine the data source based on the sensorId prefix convention.
     * Simulator-generated IDs start with "SIM-", everything else is HARDWARE.
     */
    private SourceDonnee determineSource(String sensorId) {
        if (sensorId != null && sensorId.startsWith("SIM-")) {
            return SourceDonnee.SIMULATOR;
        }
        return SourceDonnee.HARDWARE;
    }
}
