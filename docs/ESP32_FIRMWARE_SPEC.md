# ESP32 Firmware Specification — Smart Training Center 4.0

**Project:** Smart Training Center 4.0 (STC 4.0)
**Organization:** GOOD GOV IT Service & Solution
**Document Type:** Hardware Firmware Specification
**Version:** 1.0.0
**Date:** 2025-01-15
**Audience:** Embedded Systems / Hardware Engineers

---

## Table of Contents

1. [Overview](#1-overview)
2. [Hardware Components](#2-hardware-components)
3. [ESP32 Pin Mapping](#3-esp32-pin-mapping)
4. [MQTT Configuration](#4-mqtt-configuration)
5. [MQTT Topics & Payload Schemas](#5-mqtt-topics--payload-schemas)
6. [Firmware Behavior Specification](#6-firmware-behavior-specification)
7. [Sample Arduino Sketch (Pseudocode)](#7-sample-arduino-sketch-pseudocode)
8. [Device Registration](#8-device-registration)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Overview

### Purpose

This document specifies the firmware requirements for ESP32-based IoT devices that integrate with the **Smart Training Center 4.0** platform. It is intended as a complete reference for hardware engineers tasked with writing, flashing, and testing firmware on real ESP32 microcontrollers.

### Communication Protocol

The platform uses **MQTT** (Message Queuing Telemetry Transport) as the sole protocol for all IoT communication. Every sensor reading, device heartbeat, RFID scan, and status update flows through an MQTT broker to the backend.

### Hardware-Agnostic Backend

The STC 4.0 backend is fully hardware-agnostic. It subscribes to well-defined MQTT topics and processes incoming JSON payloads. The backend treats messages from real physical ESP32 devices **identically** to messages from software simulators. This means:

- The firmware must publish to the **exact** topics documented below.
- The JSON payloads must match the **exact** schemas documented below.
- If the topic and payload are correct, the backend will process the data regardless of source.

### Architecture Summary

```
[ESP32 + Sensors] ---> (WiFi) ---> [Mosquitto MQTT Broker] ---> [NestJS Backend Subscriber]
                                                                        |
                                                                        v
                                                                  [PostgreSQL DB]
                                                                        |
                                                                        v
                                                                  [Angular Frontend]
```

---

## 2. Hardware Components

### Supported Sensor Modules

| Sensor Type | Module          | Purpose                     | Interface     | Operating Voltage |
| ----------- | --------------- | --------------------------- | ------------- | ----------------- |
| Temperature | DHT22 / AM2302  | Room temperature monitoring | Digital GPIO  | 3.3V - 5V         |
| CO2         | MH-Z19B         | Air quality monitoring      | UART (Serial) | 5V (logic 3.3V)   |
| Presence    | HC-SR501 (PIR)  | Motion/occupancy detection  | Digital GPIO  | 5V - 20V          |
| RFID Reader | MFRC522 / RC522 | Student badge scanning      | SPI           | 3.3V              |

### ESP32 Board

- **Recommended board:** ESP32-WROOM-32 (DevKit v1) or ESP32-WROVER
- **Framework:** Arduino (via PlatformIO or Arduino IDE)
- **Required libraries:**
  - `WiFi.h` (built-in)
  - `PubSubClient` by Nick O'Leary (MQTT client)
  - `DHT` by Adafruit (temperature sensor)
  - `MFRC522` by miguelbalboa (RFID reader)
  - `MHZ19` by Jonathan Dempsey (CO2 sensor)
  - `ArduinoJson` by Benoit Blanchon (JSON serialization)

---

## 3. ESP32 Pin Mapping

### Recommended Pin Assignments

| Function          | GPIO Pin | ESP32 Label | Notes                            |
| ----------------- | -------- | ----------- | -------------------------------- |
| DHT22 Data        | GPIO 4   | D4          | Use 10k pull-up resistor to 3.3V |
| PIR Sensor Output | GPIO 13  | D13         | HIGH when motion detected        |
| MH-Z19B TX        | GPIO 16  | RX2         | ESP32 Hardware Serial2 RX        |
| MH-Z19B RX        | GPIO 17  | TX2         | ESP32 Hardware Serial2 TX        |
| MFRC522 SDA (SS)  | GPIO 5   | D5          | SPI Chip Select                  |
| MFRC522 SCK       | GPIO 18  | D18         | SPI Clock                        |
| MFRC522 MOSI      | GPIO 23  | D23         | SPI Master Out Slave In          |
| MFRC522 MISO      | GPIO 19  | D19         | SPI Master In Slave Out          |
| MFRC522 RST       | GPIO 22  | D22         | Reset pin                        |
| Status LED        | GPIO 2   | D2          | Built-in LED, ON = connected     |
| WiFi Status LED   | GPIO 15  | D15         | Optional external LED            |

### Wiring Diagram Notes

- **DHT22:** Connect VCC to 3.3V, GND to GND, DATA to GPIO 4. Place a 10k ohm pull-up resistor between DATA and VCC.
- **MH-Z19B:** Powered from 5V (Vin pin on ESP32). TX of sensor connects to GPIO 16 (RX2), RX of sensor connects to GPIO 17 (TX2). The sensor uses 3.3V logic levels on its UART pins.
- **HC-SR501:** Powered from 5V (Vin). Output pin connects to GPIO 13. Adjust sensitivity and delay potentiometers on the module as needed.
- **MFRC522:** Powered from 3.3V only (5V will damage the module). Uses standard VSPI bus on the ESP32.

### Important Pin Warnings

- **Do NOT use** GPIO 6-11: these are connected to the internal flash.
- **Do NOT use** GPIO 0 for sensors: it is a boot-mode strapping pin.
- **GPIO 34-39** are input-only and have no internal pull-up/pull-down resistors.

---

## 4. MQTT Configuration

### Broker Settings

| Parameter       | Value                                       |
| --------------- | ------------------------------------------- |
| Broker Software | Mosquitto                                   |
| Broker Host     | Server IP or hostname (configured per site) |
| Port            | `1883` (TCP, no TLS)                        |
| WebSocket Port  | `9001` (for debugging only, not firmware)   |
| Username        | None (default) or configured per deployment |
| Password        | None (default) or configured per deployment |

### Client Configuration

| Parameter      | Value                                           |
| -------------- | ----------------------------------------------- |
| Client ID      | `esp32-{deviceId}` (e.g., `esp32-TEMP-S1-01`)   |
| Keep-Alive     | 60 seconds                                      |
| Clean Session  | `true`                                          |
| Auto-Reconnect | **Mandatory** (must be implemented in firmware) |

### QoS Levels

| Message Type  | QoS Level | Rationale                                   |
| ------------- | --------- | ------------------------------------------- |
| Sensor Data   | QoS 1     | At-least-once delivery for reliability      |
| Heartbeat     | QoS 1     | At-least-once delivery for monitoring       |
| RFID Scans    | QoS 2     | Exactly-once delivery to prevent duplicates |
| Device Status | QoS 1     | At-least-once delivery for status tracking  |

### Last Will and Testament (LWT)

Configure the MQTT client with a Last Will message so the broker automatically publishes an OFFLINE status if the device disconnects unexpectedly:

| Parameter    | Value                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| Will Topic   | `stc/device/{deviceId}/status`                                         |
| Will Payload | `{"deviceId":"{deviceId}","status":"OFFLINE","timestamp":"{iso8601}"}` |
| Will QoS     | 1                                                                      |
| Will Retain  | `true`                                                                 |

---

## 5. MQTT Topics & Payload Schemas

### Topic Architecture

All topics follow the pattern: `stc/{category}/{identifier}/{dataType}`

```
stc/salle/{salleId}/temperature       # Temperature readings
stc/salle/{salleId}/co2               # CO2 level readings
stc/salle/{salleId}/presence          # Presence/motion detection
stc/rfid/{readerId}/scan              # RFID badge scans
stc/device/{deviceId}/status          # Device online/offline status
stc/device/{deviceId}/heartbeat       # Device health heartbeat
```

---

### 5.1 Temperature

**Topic:** `stc/salle/{salleId}/temperature`
**Example Topic:** `stc/salle/S1/temperature`
**QoS:** 1
**Publish Frequency:** Every 10 seconds

**Payload Schema:**

```json
{
  "sensorId": "TEMP-S1-01",
  "value": 23.5,
  "unit": "°C",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

| Field       | Type   | Required | Description                                             |
| ----------- | ------ | -------- | ------------------------------------------------------- |
| `sensorId`  | string | Yes      | Unique sensor identifier, format: `TEMP-{salleId}-{nn}` |
| `value`     | number | Yes      | Temperature reading in Celsius (1 decimal place)        |
| `unit`      | string | Yes      | Always `"°C"`                                           |
| `timestamp` | string | Yes      | ISO 8601 UTC timestamp of the reading                   |

**Constraints:**

- `value` valid range: -10.0 to 60.0
- Readings outside this range should be discarded by firmware as sensor error

---

### 5.2 CO2

**Topic:** `stc/salle/{salleId}/co2`
**Example Topic:** `stc/salle/S1/co2`
**QoS:** 1
**Publish Frequency:** Every 10 seconds

**Payload Schema:**

```json
{
  "sensorId": "CO2-S1-01",
  "value": 650,
  "unit": "ppm",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

| Field       | Type    | Required | Description                                            |
| ----------- | ------- | -------- | ------------------------------------------------------ |
| `sensorId`  | string  | Yes      | Unique sensor identifier, format: `CO2-{salleId}-{nn}` |
| `value`     | integer | Yes      | CO2 concentration in parts per million                 |
| `unit`      | string  | Yes      | Always `"ppm"`                                         |
| `timestamp` | string  | Yes      | ISO 8601 UTC timestamp of the reading                  |

**Constraints:**

- `value` valid range: 400 to 5000
- MH-Z19B needs a 3-minute warm-up period after power-on; do not publish during warm-up

---

### 5.3 Presence

**Topic:** `stc/salle/{salleId}/presence`
**Example Topic:** `stc/salle/S1/presence`
**QoS:** 1
**Publish Frequency:** Every 5 seconds

**Payload Schema:**

```json
{
  "sensorId": "PIR-S1-01",
  "count": 25,
  "detected": true,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

| Field       | Type    | Required | Description                                                         |
| ----------- | ------- | -------- | ------------------------------------------------------------------- |
| `sensorId`  | string  | Yes      | Unique sensor identifier, format: `PIR-{salleId}-{nn}`              |
| `count`     | integer | Yes      | Estimated occupancy count (cumulative triggers or estimation logic) |
| `detected`  | boolean | Yes      | `true` if motion currently detected, `false` otherwise              |
| `timestamp` | string  | Yes      | ISO 8601 UTC timestamp of the reading                               |

**Constraints:**

- `count` valid range: 0 to 200
- `detected` reflects the **current** state of the PIR output pin at the time of publishing

---

### 5.4 RFID Scan

**Topic:** `stc/rfid/{readerId}/scan`
**Example Topic:** `stc/rfid/RFID-R1/scan`
**QoS:** 2
**Publish Frequency:** On event (immediately when a badge is scanned)

**Payload Schema:**

```json
{
  "badgeCode": "BADGE-001",
  "readerId": "RFID-R1",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

| Field       | Type   | Required | Description                                         |
| ----------- | ------ | -------- | --------------------------------------------------- |
| `badgeCode` | string | Yes      | Badge identifier read from the RFID tag UID         |
| `readerId`  | string | Yes      | Unique reader identifier, format: `RFID-{location}` |
| `timestamp` | string | Yes      | ISO 8601 UTC timestamp of the scan event            |

**Constraints:**

- Implement a **debounce** of 3 seconds: if the same badge is scanned again within 3 seconds, ignore the duplicate
- `badgeCode` is derived from the tag UID, formatted as a string (e.g., hex UID or mapped identifier)

---

### 5.5 Device Status

**Topic:** `stc/device/{deviceId}/status`
**Example Topic:** `stc/device/TEMP-S1-01/status`
**QoS:** 1
**Publish Frequency:** On boot (ONLINE) and on graceful shutdown (OFFLINE). Also used as LWT.

**Payload Schema:**

```json
{
  "deviceId": "TEMP-S1-01",
  "status": "ONLINE",
  "firmware": "1.0.0",
  "mac": "AA:BB:CC:DD:EE:01",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

| Field       | Type   | Required | Description                                          |
| ----------- | ------ | -------- | ---------------------------------------------------- |
| `deviceId`  | string | Yes      | Unique device identifier matching the registered ID  |
| `status`    | string | Yes      | Either `"ONLINE"` or `"OFFLINE"`                     |
| `firmware`  | string | Yes      | Firmware version string (semantic versioning)        |
| `mac`       | string | Yes      | ESP32 WiFi MAC address in `XX:XX:XX:XX:XX:XX` format |
| `timestamp` | string | Yes      | ISO 8601 UTC timestamp                               |

**Notes:**

- Publish with `retain: true` so that the backend always knows the last known status even after restarting
- The LWT message (configured at MQTT connect time) handles unexpected disconnections automatically

---

### 5.6 Heartbeat

**Topic:** `stc/device/{deviceId}/heartbeat`
**Example Topic:** `stc/device/TEMP-S1-01/heartbeat`
**QoS:** 1
**Publish Frequency:** Every 30 seconds

**Payload Schema:**

```json
{
  "deviceId": "TEMP-S1-01",
  "uptime": 3600,
  "freeMemory": 45000,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

| Field        | Type    | Required | Description                                     |
| ------------ | ------- | -------- | ----------------------------------------------- |
| `deviceId`   | string  | Yes      | Unique device identifier                        |
| `uptime`     | integer | Yes      | Seconds since last boot (`millis() / 1000`)     |
| `freeMemory` | integer | Yes      | Free heap memory in bytes (`ESP.getFreeHeap()`) |
| `timestamp`  | string  | Yes      | ISO 8601 UTC timestamp                          |

**Notes:**

- If `freeMemory` drops below 10000 bytes, the firmware should log a warning (serial output)
- The backend uses heartbeats to determine device liveness; a missing heartbeat for 90+ seconds may trigger an alert

---

## 6. Firmware Behavior Specification

### 6.1 Boot Sequence

The firmware must execute the following steps in order on power-up or reset:

```
1. Initialize serial monitor (115200 baud) for debug output
2. Initialize sensor hardware (GPIO, SPI, UART as needed)
3. Connect to WiFi network
   - Retry indefinitely with 5-second intervals
   - Blink status LED while connecting
4. Synchronize time via NTP (pool.ntp.org)
   - Required for accurate ISO 8601 timestamps
5. Connect to MQTT broker
   - Configure LWT (Last Will and Testament) before connecting
   - Retry indefinitely with 5-second intervals
6. Publish ONLINE status to stc/device/{deviceId}/status (retain: true)
7. Start sensor reading loop
8. Start heartbeat timer (30-second interval)
9. Turn status LED solid ON to indicate operational
```

### 6.2 Sensor Reading Loop

```
LOOP (runs continuously):
  1. Check WiFi connection → reconnect if lost
  2. Check MQTT connection → reconnect if lost
  3. Read sensor value
  4. Validate reading (within expected range)
  5. If valid:
     - Build JSON payload
     - Generate ISO 8601 timestamp
     - Publish to appropriate MQTT topic
  6. If invalid:
     - Log error to serial
     - Skip publishing (do NOT publish bad data)
  7. Sleep for configured interval:
     - Temperature: 10 seconds
     - CO2: 10 seconds
     - Presence: 5 seconds
  8. Feed watchdog timer
```

### 6.3 Heartbeat

- Publish a heartbeat message every **30 seconds**.
- Use a non-blocking timer (`millis()` comparison), not `delay()`.
- Include `uptime` as seconds since boot: `millis() / 1000`.
- Include `freeMemory` as the result of `ESP.getFreeHeap()`.

### 6.4 RFID Handling

- RFID scanning is **interrupt-driven** or polled at high frequency (every 100ms).
- When a new card is detected:
  1. Read the card UID.
  2. Check debounce: if the same UID was scanned within the last 3 seconds, ignore it.
  3. Convert UID to badge code string.
  4. Publish immediately to `stc/rfid/{readerId}/scan` with QoS 2.
  5. Beep/flash an indicator (optional but recommended for user feedback).

### 6.5 Error Handling & Reconnection

| Scenario                            | Action                                        |
| ----------------------------------- | --------------------------------------------- |
| WiFi disconnected                   | Retry connection every 5 seconds indefinitely |
| MQTT disconnected                   | Retry connection every 5 seconds indefinitely |
| Sensor read failure                 | Log to serial, skip publish, continue loop    |
| Sensor value out of range           | Log to serial, skip publish, continue loop    |
| Free memory critically low (< 10KB) | Log warning, continue operation               |
| Watchdog timeout                    | Hardware reset (automatic)                    |

### 6.6 Watchdog Timer

- Enable the ESP32 hardware watchdog timer with a **30-second timeout**.
- Feed (reset) the watchdog at each iteration of the main loop.
- If the firmware hangs or enters an infinite loop, the watchdog will trigger a hardware reset.
- Use `esp_task_wdt_init(30, true)` and `esp_task_wdt_reset()` from the ESP-IDF API.

### 6.7 OTA (Future)

- Reserve the topic `stc/device/{deviceId}/ota` for future over-the-air firmware update commands.
- The firmware does **not** need to implement OTA handling at this stage.
- Subscribe to the topic but log any received messages without acting on them.
- This allows the backend to be extended with OTA push capability in the future.

### 6.8 Configuration Constants

All configurable values should be defined as constants at the top of the firmware source file:

```
WIFI_SSID           = "STC_Network"         // WiFi network name
WIFI_PASSWORD        = "********"            // WiFi password
MQTT_BROKER          = "192.168.1.100"       // Broker IP address
MQTT_PORT            = 1883                  // Broker port
DEVICE_ID            = "TEMP-S1-01"          // Unique device ID
SALLE_ID             = "S1"                  // Assigned room/salle
SENSOR_TYPE          = "temperature"         // One of: temperature, co2, presence, rfid
FIRMWARE_VERSION     = "1.0.0"               // Firmware version string
SENSOR_INTERVAL_MS   = 10000                 // Sensor read interval in milliseconds
HEARTBEAT_INTERVAL_MS = 30000               // Heartbeat interval in milliseconds
NTP_SERVER           = "pool.ntp.org"        // NTP server for time sync
```

---

## 7. Sample Arduino Sketch (Pseudocode)

The following is a **pseudocode outline** for a temperature sensor ESP32. It demonstrates the structure, flow, and key function calls. It is not a complete, compilable sketch.

```
// ============================================================
// STC 4.0 - ESP32 Temperature Sensor Firmware (Pseudocode)
// ============================================================

// --- INCLUDES ---
include WiFi
include PubSubClient
include DHT
include ArduinoJson
include time          // for NTP
include esp_task_wdt  // for watchdog

// --- CONFIGURATION ---
define WIFI_SSID        "STC_Network"
define WIFI_PASSWORD    "********"
define MQTT_BROKER      "192.168.1.100"
define MQTT_PORT        1883
define DEVICE_ID        "TEMP-S1-01"
define SALLE_ID         "S1"
define FIRMWARE_VERSION "1.0.0"
define DHT_PIN          4
define SENSOR_INTERVAL  10000   // 10 seconds
define HEARTBEAT_INTERVAL 30000 // 30 seconds

// --- GLOBAL OBJECTS ---
wifiClient = new WiFiClient()
mqttClient = new PubSubClient(wifiClient)
dhtSensor  = new DHT(DHT_PIN, DHT22)

lastSensorRead = 0
lastHeartbeat  = 0

// --- SETUP ---
function setup():
    Serial.begin(115200)
    dhtSensor.begin()

    // Enable hardware watchdog (30s timeout)
    esp_task_wdt_init(30, true)
    esp_task_wdt_add(NULL)

    // Connect to WiFi
    connectWiFi()

    // Sync time via NTP
    configTime(0, 0, "pool.ntp.org")
    waitForNTPSync()

    // Configure MQTT
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT)
    mqttClient.setKeepAlive(60)

    // Configure Last Will and Testament
    willTopic   = "stc/device/" + DEVICE_ID + "/status"
    willPayload = buildStatusPayload("OFFLINE")
    mqttClient.connect("esp32-" + DEVICE_ID, willTopic, QOS_1, RETAIN, willPayload)

    // Connect to MQTT
    connectMQTT()

    // Publish ONLINE status
    publishStatus("ONLINE")

    // Subscribe to OTA topic (reserved for future use)
    mqttClient.subscribe("stc/device/" + DEVICE_ID + "/ota")

    // Turn on status LED
    pinMode(2, OUTPUT)
    digitalWrite(2, HIGH)

// --- MAIN LOOP ---
function loop():
    // Feed watchdog
    esp_task_wdt_reset()

    // Ensure connectivity
    if WiFi not connected:
        connectWiFi()
    if MQTT not connected:
        connectMQTT()
        publishStatus("ONLINE")

    mqttClient.loop()  // Process incoming MQTT messages

    currentTime = millis()

    // --- Sensor Reading ---
    if (currentTime - lastSensorRead) >= SENSOR_INTERVAL:
        temperature = dhtSensor.readTemperature()

        if temperature is valid AND between -10.0 and 60.0:
            payload = {
                "sensorId":  DEVICE_ID,
                "value":     round(temperature, 1),
                "unit":      "°C",
                "timestamp": getISO8601Timestamp()
            }
            topic = "stc/salle/" + SALLE_ID + "/temperature"
            mqttClient.publish(topic, toJSON(payload), QOS_1)
            Serial.println("Published temperature: " + temperature)
        else:
            Serial.println("ERROR: Invalid temperature reading, skipping")

        lastSensorRead = currentTime

    // --- Heartbeat ---
    if (currentTime - lastHeartbeat) >= HEARTBEAT_INTERVAL:
        payload = {
            "deviceId":   DEVICE_ID,
            "uptime":     millis() / 1000,
            "freeMemory": ESP.getFreeHeap(),
            "timestamp":  getISO8601Timestamp()
        }
        topic = "stc/device/" + DEVICE_ID + "/heartbeat"
        mqttClient.publish(topic, toJSON(payload), QOS_1)

        if ESP.getFreeHeap() < 10000:
            Serial.println("WARNING: Low free memory!")

        lastHeartbeat = currentTime

// --- HELPER: Connect WiFi ---
function connectWiFi():
    Serial.println("Connecting to WiFi...")
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD)
    while WiFi not connected:
        delay(5000)
        Serial.print(".")
        esp_task_wdt_reset()  // Feed watchdog during retry
    Serial.println("WiFi connected. IP: " + WiFi.localIP())

// --- HELPER: Connect MQTT ---
function connectMQTT():
    while MQTT not connected:
        Serial.println("Connecting to MQTT broker...")
        clientId = "esp32-" + DEVICE_ID
        if mqttClient.connect(clientId, willTopic, willPayload):
            Serial.println("MQTT connected")
            mqttClient.subscribe("stc/device/" + DEVICE_ID + "/ota")
        else:
            Serial.println("MQTT failed, retrying in 5s...")
            delay(5000)
            esp_task_wdt_reset()  // Feed watchdog during retry

// --- HELPER: Publish Status ---
function publishStatus(status):
    payload = {
        "deviceId":  DEVICE_ID,
        "status":    status,
        "firmware":  FIRMWARE_VERSION,
        "mac":       WiFi.macAddress(),
        "timestamp": getISO8601Timestamp()
    }
    topic = "stc/device/" + DEVICE_ID + "/status"
    mqttClient.publish(topic, toJSON(payload), QOS_1, RETAIN)

// --- HELPER: Get ISO 8601 Timestamp ---
function getISO8601Timestamp():
    timeinfo = getLocalTime()
    return formatTime(timeinfo, "%Y-%m-%dT%H:%M:%SZ")

// --- HELPER: Build Status Payload ---
function buildStatusPayload(status):
    return toJSON({
        "deviceId":  DEVICE_ID,
        "status":    status,
        "firmware":  FIRMWARE_VERSION,
        "mac":       WiFi.macAddress(),
        "timestamp": getISO8601Timestamp()
    })

// --- MQTT CALLBACK (for OTA topic) ---
function onMqttMessage(topic, payload):
    Serial.println("Received message on: " + topic)
    Serial.println("OTA not implemented yet. Message logged.")
```

---

## 8. Device Registration

### Registration Flow

The following process must be followed for every new physical device before it can communicate with the platform:

```
+------------------+       +------------------+       +------------------+
| 1. Admin         |       | 2. Hardware      |       | 3. Device        |
|    registers     | ----> |    engineer       | ----> |    boots and     |
|    device in     |       |    flashes        |       |    connects      |
|    web UI        |       |    firmware       |       |                  |
+------------------+       +------------------+       +------------------+
                                                              |
                                                              v
                                                       +------------------+
                                                       | 4. Backend       |
                                                       |    recognizes    |
                                                       |    device and    |
                                                       |    processes     |
                                                       |    data          |
                                                       +------------------+
```

### Step-by-Step

**Step 1: Admin Registers Device in Web UI**

- An administrator logs into the STC 4.0 web application.
- Navigates to the Device Management section.
- Registers a new device with the following information:
  - **Device ID:** A unique identifier (e.g., `TEMP-S1-01`).
  - **Device Type:** One of `temperature`, `co2`, `presence`, `rfid`.
  - **Salle ID:** The room the device is assigned to (e.g., `S1`).
  - **MAC Address:** The WiFi MAC address of the specific ESP32 board (found on the board label or via a serial monitor test sketch). Format: `AA:BB:CC:DD:EE:FF`.

**Step 2: Flash Firmware with Matching Configuration**

- The hardware engineer updates the firmware configuration constants to match the registered values:
  - `DEVICE_ID` must match the registered Device ID exactly.
  - `SALLE_ID` must match the registered Salle ID exactly.
  - `SENSOR_TYPE` must match the registered Device Type exactly.
  - `MQTT_BROKER` must point to the correct Mosquitto server IP/hostname.
- Flash the firmware to the ESP32 using Arduino IDE or PlatformIO.
- Verify via serial monitor that the device boots correctly.

**Step 3: Device Boots and Connects**

- The ESP32 powers on and executes the boot sequence (see Section 6.1).
- It connects to WiFi, synchronizes time, and connects to the MQTT broker.
- It publishes an `ONLINE` status message to `stc/device/{deviceId}/status`.
- It begins publishing sensor data and heartbeats.

**Step 4: Backend Recognizes Device**

- The backend MQTT subscriber receives the `ONLINE` status message.
- It matches the `deviceId` and `mac` against the registered device database entry.
- The device status is updated to ONLINE in the platform.
- Subsequent sensor data messages are processed and stored in the database.
- The device appears as active in the web UI dashboard.

### Device ID Naming Convention

| Device Type | Format                | Example      |
| ----------- | --------------------- | ------------ |
| Temperature | `TEMP-{salleId}-{nn}` | `TEMP-S1-01` |
| CO2         | `CO2-{salleId}-{nn}`  | `CO2-S1-01`  |
| Presence    | `PIR-{salleId}-{nn}`  | `PIR-S1-01`  |
| RFID Reader | `RFID-R{nn}`          | `RFID-R1`    |

Where:

- `{salleId}` is the room identifier (e.g., `S1`, `S2`, `S3`).
- `{nn}` is a two-digit sequential number starting from `01`.

---

## 9. Troubleshooting

### Common Issues

| Issue                                | Possible Cause                              | Solution                                                                                                                                                                                                      |
| ------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WiFi not connecting                  | Wrong SSID or password                      | Verify `WIFI_SSID` and `WIFI_PASSWORD` constants. Check that the ESP32 is within WiFi range. Ensure the network is 2.4 GHz (ESP32 does not support 5 GHz).                                                    |
| MQTT connection refused              | Broker not running or wrong IP              | Verify Mosquitto is running on the server (`systemctl status mosquitto`). Check `MQTT_BROKER` IP address. Ensure port 1883 is open in firewall.                                                               |
| MQTT connection drops frequently     | Network instability or keep-alive too short | Check WiFi signal strength. Ensure keep-alive is set to 60 seconds. Verify no IP address conflicts.                                                                                                           |
| No data appearing in dashboard       | Topic mismatch or payload format error      | Compare the published topic against the backend subscription topics exactly. Validate JSON payload structure with a tool like MQTT Explorer. Check that `salleId` and `deviceId` match the registered values. |
| Device shows OFFLINE in platform     | LWT triggered or heartbeat missing          | Check serial monitor for reconnection attempts. Verify the device is still powered. Check that heartbeats are being published every 30 seconds.                                                               |
| Sensor reads NaN or -999             | Wiring issue or defective sensor            | Check all wiring connections. Verify sensor power supply voltage. Try replacing the sensor module. For DHT22, ensure the pull-up resistor is present.                                                         |
| RFID not detecting cards             | SPI wiring error or wrong pins              | Verify SPI connections (MOSI, MISO, SCK, SS, RST). Ensure MFRC522 is powered from 3.3V, not 5V. Check that the correct GPIO pins are configured.                                                              |
| Timestamps are wrong                 | NTP sync failed                             | Verify internet connectivity. Check that `pool.ntp.org` is reachable. Ensure `configTime()` is called before publishing.                                                                                      |
| ESP32 keeps rebooting                | Watchdog timeout or crash                   | Check serial monitor for crash stack traces. Ensure the watchdog is being fed in the main loop. Look for blocking calls (long `delay()`) that prevent watchdog feeding.                                       |
| CO2 sensor reads 0 or 400 constantly | Warm-up period not elapsed                  | Wait at least 3 minutes after power-on before trusting MH-Z19B readings. Verify UART TX/RX are not swapped.                                                                                                   |
| Free memory decreasing over time     | Memory leak                                 | Monitor `freeMemory` in heartbeat messages. Check for string concatenation in loops (use `ArduinoJson` properly). Consider periodic restart as a mitigation.                                                  |

### Debugging Tools

| Tool                            | Purpose                                                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Arduino Serial Monitor          | View firmware debug output at 115200 baud                                                                                                                                |
| MQTT Explorer                   | GUI tool to subscribe to all `stc/#` topics and inspect messages in real time                                                                                            |
| Mosquitto CLI (`mosquitto_sub`) | Subscribe from terminal: `mosquitto_sub -h {broker_ip} -t "stc/#" -v`                                                                                                    |
| Mosquitto CLI (`mosquitto_pub`) | Publish test messages: `mosquitto_pub -h {broker_ip} -t "stc/salle/S1/temperature" -m '{"sensorId":"TEST","value":22.0,"unit":"°C","timestamp":"2025-01-15T00:00:00Z"}'` |
| Multimeter                      | Verify voltage levels at sensor pins (3.3V or 5V as required)                                                                                                            |
| PlatformIO Monitor              | Alternative to Arduino Serial Monitor with filtering capabilities                                                                                                        |

### Pre-Deployment Checklist

Before deploying a device to a training room, verify the following:

- [ ] Device ID matches the registration in the web UI
- [ ] MAC address matches the registration in the web UI
- [ ] WiFi credentials are correct for the deployment site
- [ ] MQTT broker IP/hostname is correct
- [ ] Sensor is wired correctly per the pin mapping table
- [ ] Serial monitor shows successful WiFi connection
- [ ] Serial monitor shows successful MQTT connection
- [ ] ONLINE status message appears in MQTT Explorer
- [ ] Sensor data messages appear in MQTT Explorer with correct topic and payload
- [ ] Heartbeat messages appear every 30 seconds
- [ ] Data appears correctly in the web UI dashboard
- [ ] Device survives a power cycle and reconnects automatically
- [ ] Unplugging network cable triggers OFFLINE status via LWT within 90 seconds

---

## Document History

| Version | Date       | Author       | Changes         |
| ------- | ---------- | ------------ | --------------- |
| 1.0.0   | 2025-01-15 | STC 4.0 Team | Initial release |
