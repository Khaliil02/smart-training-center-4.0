package com.goodgovit.stc.websocket;

import com.goodgovit.stc.dto.AlerteDto;
import com.goodgovit.stc.dto.EnvironnementDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Push real-time sensor data to WebSocket subscribers for a specific room.
     * Clients subscribe to: /topic/salles/{salleId}/realtime
     */
    public void pushSensorData(Long salleId, EnvironnementDto data) {
        String destination = "/topic/salles/" + salleId + "/realtime";
        messagingTemplate.convertAndSend(destination, data);
        log.debug("WebSocket push to {}: {}", destination, data);
    }

    /**
     * Push alert notification to all subscribers.
     * Clients subscribe to: /topic/alerts
     */
    public void pushAlert(AlerteDto alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
        log.debug("WebSocket alert push: {}", alert);
    }

    /**
     * Push device status update.
     * Clients subscribe to: /topic/devices/status
     */
    public void pushDeviceStatus(String deviceId, boolean online) {
        messagingTemplate.convertAndSend("/topic/devices/status",
                java.util.Map.of("deviceId", deviceId, "online", online));
        log.debug("WebSocket device status: {} -> {}", deviceId, online ? "ONLINE" : "OFFLINE");
    }
}
