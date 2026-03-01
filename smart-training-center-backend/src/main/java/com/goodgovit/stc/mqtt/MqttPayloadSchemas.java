package com.goodgovit.stc.mqtt;

public final class MqttPayloadSchemas {

    private MqttPayloadSchemas() {
    }

    // ── MQTT Topic patterns (wildcards for subscription) ──
    public static final String TOPIC_TEMPERATURE = "stc/salle/+/temperature";
    public static final String TOPIC_CO2 = "stc/salle/+/co2";
    public static final String TOPIC_PRESENCE = "stc/salle/+/presence";
    public static final String TOPIC_RFID_SCAN = "stc/rfid/+/scan";
    public static final String TOPIC_DEVICE_STATUS = "stc/device/+/status";
    public static final String TOPIC_DEVICE_HEARTBEAT = "stc/device/+/heartbeat";

    // ── Topic prefixes for matching ──
    public static final String PREFIX_SALLE = "stc/salle/";
    public static final String PREFIX_RFID = "stc/rfid/";
    public static final String PREFIX_DEVICE = "stc/device/";

    // ── Threshold constants ──
    public static final float TEMPERATURE_THRESHOLD = 30.0f;
    public static final float CO2_THRESHOLD = 1000.0f;

    /**
     * Extracts the salle ID from a topic like "stc/salle/{salleId}/temperature".
     * Returns null if the topic doesn't match the expected pattern.
     */
    public static Long extractSalleId(String topic) {
        if (topic != null && topic.startsWith(PREFIX_SALLE)) {
            String[] parts = topic.split("/");
            if (parts.length >= 4) {
                try {
                    return Long.parseLong(parts[2]);
                } catch (NumberFormatException e) {
                    return null;
                }
            }
        }
        return null;
    }

    /**
     * Extracts the device/reader ID from a topic like "stc/device/{deviceId}/status"
     * or "stc/rfid/{readerId}/scan".
     */
    public static String extractDeviceId(String topic) {
        if (topic != null) {
            String[] parts = topic.split("/");
            if (parts.length >= 4) {
                return parts[2];
            }
        }
        return null;
    }

    /**
     * Extracts the message type (last segment) from a topic.
     * e.g., "stc/salle/1/temperature" → "temperature"
     */
    public static String extractMessageType(String topic) {
        if (topic != null) {
            String[] parts = topic.split("/");
            if (parts.length > 0) {
                return parts[parts.length - 1];
            }
        }
        return null;
    }

    /**
     * Builds a publish topic for a specific salle and type.
     * e.g., buildSalleTopic(1, "temperature") → "stc/salle/1/temperature"
     */
    public static String buildSalleTopic(Long salleId, String type) {
        return PREFIX_SALLE + salleId + "/" + type;
    }

    /**
     * Builds a publish topic for a device.
     * e.g., buildDeviceTopic("sensor-1", "heartbeat") → "stc/device/sensor-1/heartbeat"
     */
    public static String buildDeviceTopic(String deviceId, String type) {
        return PREFIX_DEVICE + deviceId + "/" + type;
    }

    /**
     * Builds a publish topic for an RFID reader scan.
     */
    public static String buildRfidTopic(String readerId) {
        return PREFIX_RFID + readerId + "/scan";
    }
}
