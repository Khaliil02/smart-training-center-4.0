package com.goodgovit.stc.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.mqtt.MqttPayloadSchemas;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.messaging.Message;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Random;

@Service
@ConditionalOnProperty(name = "stc.iot.simulator.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class IoTSimulatorService {

    private final MqttPahoMessageHandler mqttOutboundHandler;
    private final ObjectMapper objectMapper;

    private final Random random = new Random();

    // Simulated salle IDs (matching seed data)
    private static final List<Long> SALLE_IDS = List.of(1L, 2L, 3L);

    // Simulated device MAC addresses (matching seed data format)
    private static final List<String> TEMP_SENSORS = List.of("SIM-AA:BB:CC:DD:EE:01", "SIM-AA:BB:CC:DD:EE:04", "SIM-AA:BB:CC:DD:EE:07");
    private static final List<String> CO2_SENSORS = List.of("SIM-AA:BB:CC:DD:EE:02", "SIM-AA:BB:CC:DD:EE:05", "SIM-AA:BB:CC:DD:EE:08");
    private static final List<String> PRESENCE_SENSORS = List.of("SIM-AA:BB:CC:DD:EE:03", "SIM-AA:BB:CC:DD:EE:06", "SIM-AA:BB:CC:DD:EE:09");

    // Simulated badge codes (matching seed data)
    private static final List<String> BADGE_CODES = List.of("BADGE-ETU-001", "BADGE-ETU-002");

    // Simulated RFID reader IDs
    private static final List<String> RFID_READERS = List.of("SIM-RFID-READER-01", "SIM-RFID-READER-02");

    private int tickCounter = 0;

    /**
     * Publishes sensor data every 5 seconds.
     * Simulates temperature, CO2, and presence for all configured salles.
     */
    @Scheduled(fixedRateString = "${stc.iot.simulator.sensor-interval:5000}")
    public void publishSensorData() {
        tickCounter++;
        String timestamp = Instant.now().toString();

        for (int i = 0; i < SALLE_IDS.size(); i++) {
            Long salleId = SALLE_IDS.get(i);

            // Temperature: 18-32°C with some variation, occasionally spike above 30°C
            float temperature = 20.0f + random.nextFloat() * 8.0f;
            if (tickCounter % 20 == 0 && i == 0) {
                temperature = 31.0f + random.nextFloat() * 3.0f; // Simulate alert condition
            }

            publishTemperature(salleId, TEMP_SENSORS.get(i), temperature, timestamp);

            // CO2: 400-900 ppm normally, occasionally spike above 1000 ppm
            float co2 = 400.0f + random.nextFloat() * 500.0f;
            if (tickCounter % 25 == 0 && i == 1) {
                co2 = 1050.0f + random.nextFloat() * 200.0f; // Simulate alert condition
            }

            publishCo2(salleId, CO2_SENSORS.get(i), co2, timestamp);

            // Presence: 0-30 people
            int presenceCount = random.nextInt(31);
            boolean detected = presenceCount > 0;

            publishPresence(salleId, PRESENCE_SENSORS.get(i), presenceCount, detected, timestamp);
        }

        log.debug("Simulator: published sensor data for {} salles (tick #{})", SALLE_IDS.size(), tickCounter);
    }

    /**
     * Publishes RFID badge scans at random intervals (roughly every 15-30 seconds).
     */
    @Scheduled(fixedRate = 10000)
    public void publishRfidScans() {
        // 30% chance of a scan each tick
        if (random.nextFloat() > 0.3f) return;

        String badgeCode = BADGE_CODES.get(random.nextInt(BADGE_CODES.size()));
        String readerId = RFID_READERS.get(random.nextInt(RFID_READERS.size()));
        String timestamp = Instant.now().toString();

        RfidScanPayload payload = RfidScanPayload.builder()
                .badgeCode(badgeCode)
                .readerId(readerId)
                .timestamp(timestamp)
                .build();

        String topic = MqttPayloadSchemas.buildRfidTopic(readerId);
        publish(topic, payload);

        log.debug("Simulator: RFID scan published - badge={}, reader={}", badgeCode, readerId);
    }

    /**
     * Publishes device heartbeats every 30 seconds.
     */
    @Scheduled(fixedRateString = "${stc.iot.simulator.heartbeat-interval:30000}")
    public void publishHeartbeats() {
        String timestamp = Instant.now().toString();

        List<String> allDevices = new java.util.ArrayList<>();
        allDevices.addAll(TEMP_SENSORS);
        allDevices.addAll(CO2_SENSORS);
        allDevices.addAll(PRESENCE_SENSORS);

        for (String deviceId : allDevices) {
            DeviceHeartbeatPayload payload = DeviceHeartbeatPayload.builder()
                    .deviceId(deviceId)
                    .uptime(tickCounter * 5L) // Approximate uptime in seconds
                    .freeMemory(30000L + random.nextInt(20000))
                    .timestamp(timestamp)
                    .build();

            String topic = MqttPayloadSchemas.buildDeviceTopic(deviceId, "heartbeat");
            publish(topic, payload);
        }

        log.debug("Simulator: heartbeats published for {} devices", allDevices.size());
    }

    /**
     * Occasionally publishes an OFFLINE device status to test alerting (every ~2 minutes).
     */
    @Scheduled(fixedRate = 60000)
    public void publishOccasionalOffline() {
        // 20% chance each minute
        if (random.nextFloat() > 0.2f) return;

        List<String> allDevices = new java.util.ArrayList<>();
        allDevices.addAll(TEMP_SENSORS);
        allDevices.addAll(CO2_SENSORS);
        allDevices.addAll(PRESENCE_SENSORS);

        String deviceId = allDevices.get(random.nextInt(allDevices.size()));
        String timestamp = Instant.now().toString();

        DeviceStatusPayload payload = DeviceStatusPayload.builder()
                .deviceId(deviceId)
                .status("OFFLINE")
                .firmware("1.0.0-sim")
                .mac(deviceId)
                .timestamp(timestamp)
                .build();

        String topic = MqttPayloadSchemas.buildDeviceTopic(deviceId, "status");
        publish(topic, payload);

        log.info("Simulator: OFFLINE status published for device {}", deviceId);

        // Bring it back online after 10 seconds (scheduled separately won't work, so just send ONLINE immediately after)
        DeviceStatusPayload onlinePayload = DeviceStatusPayload.builder()
                .deviceId(deviceId)
                .status("ONLINE")
                .firmware("1.0.0-sim")
                .mac(deviceId)
                .timestamp(Instant.now().toString())
                .build();

        // Use a simple thread to delay the online status
        new Thread(() -> {
            try {
                Thread.sleep(10000);
                publish(MqttPayloadSchemas.buildDeviceTopic(deviceId, "status"), onlinePayload);
                log.info("Simulator: ONLINE status restored for device {}", deviceId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }

    // ── Private publish helpers ──

    private void publishTemperature(Long salleId, String sensorId, float value, String timestamp) {
        TemperaturePayload payload = TemperaturePayload.builder()
                .sensorId(sensorId)
                .value(Math.round(value * 10.0f) / 10.0f) // Round to 1 decimal
                .unit("°C")
                .timestamp(timestamp)
                .build();

        String topic = MqttPayloadSchemas.buildSalleTopic(salleId, "temperature");
        publish(topic, payload);
    }

    private void publishCo2(Long salleId, String sensorId, float value, String timestamp) {
        Co2Payload payload = Co2Payload.builder()
                .sensorId(sensorId)
                .value(Math.round(value))
                .unit("ppm")
                .timestamp(timestamp)
                .build();

        String topic = MqttPayloadSchemas.buildSalleTopic(salleId, "co2");
        publish(topic, payload);
    }

    private void publishPresence(Long salleId, String sensorId, int count, boolean detected, String timestamp) {
        PresencePayload payload = PresencePayload.builder()
                .sensorId(sensorId)
                .count(count)
                .detected(detected)
                .timestamp(timestamp)
                .build();

        String topic = MqttPayloadSchemas.buildSalleTopic(salleId, "presence");
        publish(topic, payload);
    }

    private void publish(String topic, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            Message<String> message = MessageBuilder
                    .withPayload(json)
                    .setHeader(MqttHeaders.TOPIC, topic)
                    .build();
            mqttOutboundHandler.handleMessage(message);
        } catch (Exception e) {
            log.error("Failed to publish MQTT message to topic {}: {}", topic, e.getMessage());
        }
    }
}
