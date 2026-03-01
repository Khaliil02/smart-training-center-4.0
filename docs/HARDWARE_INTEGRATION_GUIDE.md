# Hardware Integration Guide

## Smart Training Center 4.0 - From Simulator to Real ESP32 Hardware

**Project**: PFE - Smart Training Center 4.0
**Company**: GOOD GOV IT Service & Solution
**Document Version**: 1.0
**Date**: March 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Prerequisites](#2-prerequisites)
3. [Architecture Comparison](#3-architecture-comparison)
4. [Step-by-Step Transition](#4-step-by-step-transition)
5. [Configuration Reference](#5-configuration-reference)
6. [Monitoring & Troubleshooting](#6-monitoring--troubleshooting)
7. [Rollback](#7-rollback)
8. [Security Considerations](#8-security-considerations)

---

## 1. Introduction

### Purpose

This guide walks technicians through the process of replacing the built-in IoT software simulator with real ESP32 hardware devices. By the end of this guide, the Smart Training Center 4.0 platform will be receiving live sensor data from physical devices deployed in training rooms.

### Key Principle

The Smart Training Center 4.0 platform was designed **hardware-agnostic from day one**. The backend consumes MQTT messages that conform to a well-defined JSON schema. It does not care whether those messages originate from a software simulator or a physical ESP32 board. The MQTT topic structure and payload format are the contract --- not the device that produces them.

**The transition requires ZERO code changes in the backend or frontend.**

### What Changes

The only actions required to move from simulated to real hardware are:

1. **Stop the simulator** by switching the Spring profile from `simulator` to `production`.
2. **Configure broker credentials** so that only authorized devices can publish data.
3. **Connect physical ESP32 devices** that publish MQTT messages in the expected format.

Everything else --- the Spring Boot backend, the Angular frontend, the MySQL database, the WebSocket layer, the alert engine --- remains completely unchanged.

---

## 2. Prerequisites

Before beginning the hardware transition, ensure the following are in place:

### Software & Infrastructure

- A **working Smart Training Center 4.0 deployment** with all services running:
  - Spring Boot backend
  - Angular frontend
  - MySQL database
  - Mosquitto MQTT broker
- **Arduino IDE** (v2.x or later) or **PlatformIO** installed for firmware development
- **MQTT Explorer** (optional but recommended) for debugging MQTT traffic
- A terminal/SSH client for server configuration

### Hardware

- **ESP32 development boards** (one per sensor station) with appropriate sensors
  - See `ESP32_FIRMWARE_SPEC.md` for detailed sensor wiring and pin mappings
- **USB cables** (micro-USB or USB-C depending on ESP32 variant) for flashing firmware
- **Breadboards and jumper wires** for prototyping sensor connections
- **Power supplies** (5V USB adapters) for permanent deployment

### Network

- A **WiFi network** accessible to both the ESP32 devices and the Mosquitto MQTT broker
- The ESP32 devices must be able to reach the Mosquitto broker on **port 1883** (or 8883 for TLS)
- Ensure no firewall rules block MQTT traffic between the device subnet and the broker

---

## 3. Architecture Comparison

The following diagrams illustrate that **only the data source changes** during the transition. The entire backend and frontend pipeline remains identical.

### Current State: Software Simulator

```
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|   IoT Simulator   | MQTT  |    Mosquitto      | MQTT  |   Spring Boot     |
|   (Java Thread)   +-------> Broker            +------->   Backend         |
|                   | :1883 |                   |       |                   |
+-------------------+       +-------------------+       +---------+---------+
                                                                  |
                                                            WebSocket
                                                                  |
                                                        +---------+---------+
                                                        |                   |
                                                        |   Angular         |
                                                        |   Frontend        |
                                                        |                   |
                                                        +-------------------+
```

### Target State: Real ESP32 Hardware

```
+-------------------+       +-------------------+       +-------------------+
|                   |       |                   |       |                   |
|   ESP32 Device 1  | MQTT  |    Mosquitto      | MQTT  |   Spring Boot     |
|   (Temperature)   +---+---> Broker            +------->   Backend         |
|                   |   |   |                   |       |   (UNCHANGED)     |
+-------------------+   |   +-------------------+       +---------+---------+
                        |                                         |
+-------------------+   |                                   WebSocket
|                   |   |                                         |
|   ESP32 Device 2  +---+                               +---------+---------+
|   (Humidity)      |   |                               |                   |
|                   |   |                               |   Angular         |
+-------------------+   |                               |   Frontend        |
                        |                               |   (UNCHANGED)     |
+-------------------+   |                               +-------------------+
|                   |   |
|   ESP32 Device N  +---+
|   (RFID / Other)  |
|                   |
+-------------------+
```

### What Stays the Same

```
+-----------------------------------------------------------------------+
|                        UNCHANGED COMPONENTS                           |
|                                                                       |
|   - Mosquitto MQTT Broker (same topics, same message format)          |
|   - Spring Boot Backend  (same MQTT listeners, same REST APIs)        |
|   - MySQL Database       (same schema, same queries)                  |
|   - Angular Frontend     (same dashboards, same WebSocket client)     |
|   - Alert Engine         (same threshold logic, same notifications)   |
|   - WebSocket Layer      (same real-time push to browsers)            |
|                                                                       |
+-----------------------------------------------------------------------+
```

---

## 4. Step-by-Step Transition

### Step 1: Secure the MQTT Broker

Before connecting physical devices to the broker, it is essential to enable authentication. In the simulator setup, the broker may accept anonymous connections. For production with real hardware, this must be locked down.

#### 1.1 Create a Password File

Open a terminal on the machine running Mosquitto and create a password file:

```bash
# Create a new password file and add the first user
mosquitto_passwd -c /etc/mosquitto/passwd stc_backend

# You will be prompted to enter and confirm a password
# Choose a strong password and note it down

# Add a user for ESP32 devices
mosquitto_passwd /etc/mosquitto/passwd stc_device

# You will be prompted to enter and confirm a password
```

#### 1.2 Edit mosquitto.conf

Edit the Mosquitto configuration file to enforce authentication:

```conf
# /etc/mosquitto/mosquitto.conf

# ============================================
# Smart Training Center 4.0 - Production Config
# ============================================

# Listener
listener 1883

# Disable anonymous access
allow_anonymous false

# Password file
password_file /etc/mosquitto/passwd

# Logging
log_dest file /var/log/mosquitto/mosquitto.log
log_type all
connection_messages true
log_timestamp true
log_timestamp_format %Y-%m-%dT%H:%M:%S

# Persistence
persistence true
persistence_location /var/lib/mosquitto/

# Optional: limit message size (64KB should be more than enough)
message_size_limit 65536
```

#### 1.3 Restart Mosquitto

```bash
# If running as a system service
sudo systemctl restart mosquitto

# If running in Docker
docker restart mosquitto
```

#### 1.4 Update Backend MQTT Credentials

In the backend's `application.yml` (or via environment variables in `docker-compose.yml`), add the MQTT credentials:

```yaml
# application.yml (production profile)
mqtt:
  broker-url: tcp://mosquitto:1883
  username: stc_backend
  password: your_secure_password_here
```

Or in `docker-compose.yml`:

```yaml
backend:
  environment:
    - MQTT_BROKER_URL=tcp://mosquitto:1883
    - MQTT_USERNAME=stc_backend
    - MQTT_PASSWORD=your_secure_password_here
```

#### 1.5 Update ESP32 Firmware Credentials

In the ESP32 firmware configuration (see Step 4), set the same broker credentials:

```cpp
// config.h
#define MQTT_USER     "stc_device"
#define MQTT_PASSWORD "your_device_password_here"
```

#### 1.6 Verify Authentication

Test that anonymous connections are rejected and authenticated connections succeed:

```bash
# This should FAIL (anonymous)
mosquitto_pub -h localhost -t "test/auth" -m "hello"

# This should SUCCEED (authenticated)
mosquitto_pub -h localhost -t "test/auth" -m "hello" -u stc_backend -P your_secure_password_here
```

---

### Step 2: Disable the Software Simulator

The simulator runs as a Spring component that is activated by the `simulator` profile. Disabling it is a single configuration change.

#### Option A: Change the Spring Profile (Recommended)

In `docker-compose.yml`, change the active profile:

```yaml
backend:
  environment:
    # BEFORE (simulator mode)
    # - SPRING_PROFILES_ACTIVE=simulator

    # AFTER (production mode - real hardware)
    - SPRING_PROFILES_ACTIVE=production
```

#### Option B: Disable via Application Property

Alternatively, in `application.yml`, explicitly disable the simulator:

```yaml
stc:
  iot:
    simulator:
      enabled: false
```

#### Restart the Backend

```bash
# If using Docker Compose
docker-compose restart backend

# Or rebuild and restart
docker-compose up -d --build backend
```

#### Verify the Simulator is Stopped

After restarting, confirm that no simulated data is being generated:

1. Open the Angular frontend and navigate to any salle dashboard.
2. Observe that **no new sensor readings** are appearing (the charts should stop updating).
3. Check the backend logs for confirmation:

```bash
docker logs backend --tail 50
```

You should NOT see log lines like:

```
[Simulator] Publishing simulated temperature: 23.5 for salle 1
```

If the dashboards are quiet and no simulated data is flowing, the simulator is successfully disabled.

---

### Step 3: Register Devices in the Platform

Each physical ESP32 device must be registered in the platform before it can send data. This associates the hardware with a specific room (salle) and sensor type.

#### 3.1 Log In as Administrator

- Open the Angular frontend in your browser.
- Log in with an account that has the **ADMINISTRATEUR** role.

#### 3.2 Navigate to Device Registration

- Go to **Appareils IoT** in the side navigation menu.
- Click **Enregistrer un appareil** (Register a Device).

#### 3.3 Register Each Device

For each physical ESP32 device, fill in the registration form:

| Field                | Description                                            | Example           |
| -------------------- | ------------------------------------------------------ | ----------------- |
| **Type**             | The type of sensor the device reports                  | TEMPERATURE       |
| **Adresse MAC**      | The MAC address of the ESP32 (found in Serial Monitor) | AA:BB:CC:DD:EE:01 |
| **Version Firmware** | The firmware version flashed on the device             | 1.0.0             |
| **Salle**            | The training room where this device is deployed        | Salle Alpha       |

#### 3.4 Note the Assigned IDs

After registration, the platform assigns unique identifiers. **Note these down carefully** --- they must be configured in the ESP32 firmware:

- **Device ID**: The unique identifier for the device (e.g., `1`, `2`, `3`...)
- **Sensor ID**: The identifier for the sensor associated with the device
- **Salle ID**: The numeric ID of the assigned room

These IDs are used to construct the correct MQTT topics so the backend can route data to the right room and sensor type.

---

### Step 4: Prepare the ESP32 Firmware

Refer to `ESP32_FIRMWARE_SPEC.md` for the complete firmware specification, including pin mappings, wiring diagrams, sensor libraries, and full source code.

#### 4.1 Open the Firmware Project

Open the ESP32 firmware project in Arduino IDE or PlatformIO.

#### 4.2 Configure WiFi Settings

Edit the configuration header file with your WiFi network details:

```cpp
// config.h

// WiFi Configuration
#define WIFI_SSID     "YourTrainingCenterWiFi"
#define WIFI_PASSWORD "YourWiFiPassword"
```

#### 4.3 Configure MQTT Settings

Set the MQTT broker connection details. The IP address should point to the machine running Mosquitto:

```cpp
// config.h

// MQTT Configuration
#define MQTT_SERVER   "192.168.1.100"    // IP of your Mosquitto broker
#define MQTT_PORT     1883
#define MQTT_USER     "stc_device"
#define MQTT_PASSWORD "your_device_password_here"
```

#### 4.4 Configure Device Identity

Set the device, sensor, and salle IDs to match the values assigned during registration in Step 3:

```cpp
// config.h

// Device Identity (must match platform registration)
#define DEVICE_ID     "1"
#define SENSOR_ID     "1"
#define SALLE_ID      "1"
```

#### 4.5 Flash the Firmware

1. Connect the ESP32 to your computer via USB.
2. In Arduino IDE:
   - Select **Board**: `ESP32 Dev Module` (or your specific variant)
   - Select **Port**: the COM port where the ESP32 appears
   - Click **Upload**
3. In PlatformIO:
   ```bash
   pio run --target upload
   ```

#### 4.6 Verify via Serial Monitor

Open the Serial Monitor (115200 baud) and confirm:

```
[STC] Smart Training Center 4.0 - ESP32 Sensor Node
[STC] Device ID: 1 | Salle ID: 1
[WiFi] Connecting to YourTrainingCenterWiFi...
[WiFi] Connected! IP: 192.168.1.42
[MQTT] Connecting to 192.168.1.100:1883...
[MQTT] Connected to broker
[MQTT] Publishing to stc/salles/1/sensors/temperature
[SENSOR] Temperature: 23.4 C | Humidity: 45.2%
[MQTT] Message published successfully
```

Repeat Steps 4.2 through 4.6 for each ESP32 device, adjusting the Device ID, Sensor ID, and Salle ID accordingly.

---

### Step 5: Deploy Devices

With the firmware flashed and verified on the bench, deploy the ESP32 devices to their designated training rooms.

#### 5.1 Power On the ESP32

- Connect each ESP32 to a USB power adapter in the target room.
- Ensure the power supply provides stable 5V output.

#### 5.2 Verify WiFi Connection

If a serial connection is available, open the Serial Monitor and confirm:

```
[WiFi] Connected! IP: 192.168.1.XX
```

If serial is not available, check your WiFi router's client list to confirm the ESP32 has connected.

#### 5.3 Verify MQTT Connection

Confirm that the device is successfully connecting to the Mosquitto broker:

```bash
# Check Mosquitto logs for new client connections
tail -f /var/log/mosquitto/mosquitto.log
```

You should see entries like:

```
New client connected from 192.168.1.42 as stc-device-1 (p2, c1, k60, u'stc_device')
```

Alternatively, use **MQTT Explorer** to connect to the broker and visually inspect incoming messages on the `stc/` topic tree.

#### 5.4 Verify Device Status in the Platform

1. Open the Angular frontend.
2. Navigate to **Appareils IoT**.
3. The device should appear with status **"En ligne"** (Online) with a green indicator.
4. If the device shows "Hors ligne" (Offline), check:
   - WiFi connectivity
   - MQTT broker reachability
   - Correct credentials in firmware
   - Correct device ID in firmware matching registration

#### 5.5 Verify Sensor Data Flow

1. Navigate to the **Salle detail page** for the room where the device is deployed.
2. Confirm that **live sensor readings** are appearing on the charts.
3. The data should update at the interval configured in the firmware (typically every 10-30 seconds).

---

### Step 6: Validate the Integration

Once all devices are deployed, perform a full validation to ensure the entire system is working end-to-end.

#### 6.1 Verify All Sensor Types

For each type of sensor deployed, confirm data is being received:

| Sensor Type     | Validation Method                                          |
| --------------- | ---------------------------------------------------------- |
| Temperature     | Check salle dashboard for temperature readings             |
| Humidity        | Check salle dashboard for humidity readings                |
| Air Quality     | Check salle dashboard for CO2/air quality index            |
| Luminosity      | Check salle dashboard for light level readings             |
| Noise Level     | Check salle dashboard for decibel readings                 |
| Motion/Presence | Check occupancy status updates on salle page               |
| RFID            | Scan a badge and verify access event appears in the system |

#### 6.2 Verify Alert Triggering

Test that alerts fire correctly when thresholds are exceeded:

1. Deliberately create a condition that exceeds a configured threshold (e.g., heat a temperature sensor above the maximum threshold).
2. Verify that an **alert notification** appears in the platform.
3. Confirm the alert details are correct (sensor type, value, salle, timestamp).

#### 6.3 Test RFID Badge Scanning

If RFID readers are deployed:

1. Scan a registered RFID badge at the reader.
2. Verify that the badge scan event appears in the platform.
3. Confirm the correct user (formateur/participant) is associated with the scan.

#### 6.4 Confirm WebSocket Real-Time Updates

1. Open the Angular frontend in a browser.
2. Open the browser developer tools (F12) and go to the Network tab.
3. Filter for WebSocket connections.
4. Verify that sensor data updates arrive in real-time without needing to refresh the page.

#### 6.5 Confirm Device Heartbeats

1. Go to **Appareils IoT** and verify all devices show **"En ligne"** status.
2. Wait for at least 2 heartbeat intervals (default: 60 seconds each).
3. Confirm devices remain online, indicating heartbeats are being received regularly.
4. To test offline detection, disconnect one ESP32 from power and verify it transitions to **"Hors ligne"** after the heartbeat timeout expires.

---

## 5. Configuration Reference

The following table lists all configurable properties relevant to the hardware transition:

| Property                    | Location                                    | Default                | Description                                                                                                                                        |
| --------------------------- | ------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SPRING_PROFILES_ACTIVE`    | `docker-compose.yml` / environment variable | `simulator`            | Set to `production` to disable the simulator and accept real hardware data.                                                                        |
| `stc.iot.simulator.enabled` | `application.yml`                           | `false`                | Explicit toggle for the IoT simulator. When the `simulator` profile is active, this defaults to `true`. Set to `false` to disable.                 |
| `mqtt.broker-url`           | `application.yml`                           | `tcp://localhost:1883` | The full URL of the Mosquitto MQTT broker. Use `tcp://` for plain MQTT or `ssl://` for TLS-encrypted connections.                                  |
| `mqtt.username`             | `application.yml`                           | _(empty)_              | The username for MQTT broker authentication. Must match a user in the Mosquitto password file.                                                     |
| `mqtt.password`             | `application.yml`                           | _(empty)_              | The password for MQTT broker authentication. Must match the password set via `mosquitto_passwd`.                                                   |
| `stc.iot.heartbeat-timeout` | `application.yml`                           | `60`                   | Time in seconds to wait before marking a device as OFFLINE if no heartbeat is received. Increase this value if devices are on unreliable networks. |

### Environment Variable Overrides

All `application.yml` properties can be overridden via environment variables using Spring Boot's relaxed binding rules. Replace dots with underscores and use uppercase:

| application.yml Property    | Environment Variable Equivalent |
| --------------------------- | ------------------------------- |
| `mqtt.broker-url`           | `MQTT_BROKER_URL`               |
| `mqtt.username`             | `MQTT_USERNAME`                 |
| `mqtt.password`             | `MQTT_PASSWORD`                 |
| `stc.iot.simulator.enabled` | `STC_IOT_SIMULATOR_ENABLED`     |
| `stc.iot.heartbeat-timeout` | `STC_IOT_HEARTBEAT_TIMEOUT`     |

---

## 6. Monitoring & Troubleshooting

### Checking Device Status

Open the admin dashboard and navigate to **Appareils IoT**. Each registered device displays:

- **Status**: En ligne (Online) / Hors ligne (Offline)
- **Dernier signal**: Timestamp of the last received heartbeat or message
- **Salle**: The assigned training room
- **Type**: The sensor type

### Viewing MQTT Traffic

Use the `mosquitto_sub` command to monitor MQTT messages in real time:

```bash
# Subscribe to ALL Smart Training Center topics
mosquitto_sub -h localhost -u stc_backend -P your_password -t "stc/#" -v

# Subscribe to a specific salle's sensor data
mosquitto_sub -h localhost -u stc_backend -P your_password -t "stc/salles/1/sensors/#" -v

# Subscribe to device heartbeats only
mosquitto_sub -h localhost -u stc_backend -P your_password -t "stc/devices/+/heartbeat" -v

# Subscribe to RFID events only
mosquitto_sub -h localhost -u stc_backend -P your_password -t "stc/salles/+/rfid" -v
```

### Common Issues

#### Device Shows "Hors ligne" (Offline)

| Possible Cause              | Diagnosis                                         | Solution                                                |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| WiFi not connected          | Check Serial Monitor for WiFi errors              | Verify SSID/password, check WiFi signal strength        |
| MQTT broker unreachable     | `ping` the broker IP from the same network        | Check firewall rules, verify broker is running          |
| Wrong MQTT credentials      | Check Mosquitto logs for authentication failures  | Update firmware with correct username/password          |
| Wrong device ID             | Device ID in firmware does not match registration | Verify device ID matches the value assigned in Step 3   |
| Heartbeat timeout too short | Device heartbeat interval exceeds server timeout  | Increase `stc.iot.heartbeat-timeout` in application.yml |

#### No Sensor Data Appearing

| Possible Cause               | Diagnosis                                          | Solution                                                              |
| ---------------------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| Wrong MQTT topic             | Use MQTT Explorer to check published topic names   | Verify topic format matches `stc/salles/{salleId}/sensors/{type}`     |
| Wrong JSON payload format    | Subscribe to the topic and inspect the raw payload | Compare payload against the expected schema in ESP32_FIRMWARE_SPEC.md |
| Sensor hardware wiring issue | Check Serial Monitor for sensor read errors        | Verify wiring against pin mapping in ESP32_FIRMWARE_SPEC.md           |
| Backend not subscribed       | Check backend logs for MQTT subscription messages  | Restart backend and verify MQTT connection logs                       |

#### Alerts Not Triggering

| Possible Cause            | Diagnosis                                           | Solution                                                    |
| ------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| No alert rules configured | Check Alertes page in admin dashboard               | Create alert rules for the relevant sensor types and salles |
| Threshold not exceeded    | Compare incoming values with configured thresholds  | Adjust thresholds or simulate an extreme value for testing  |
| Alert cooldown active     | Recent alert may have triggered the cooldown period | Wait for cooldown to expire, then test again                |

### Log Locations

| Component           | Log Location                       | How to Access                                                                       |
| ------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| Spring Boot Backend | Container stdout / application log | `docker logs backend --tail 100 -f`                                                 |
| Mosquitto Broker    | `/var/log/mosquitto/mosquitto.log` | `tail -f /var/log/mosquitto/mosquitto.log` or `docker logs mosquitto --tail 100 -f` |
| ESP32 Device        | Serial output (USB)                | Arduino IDE Serial Monitor at 115200 baud                                           |
| Angular Frontend    | Browser developer console          | Press F12 in the browser, navigate to Console tab                                   |

---

## 7. Rollback

If issues arise and you need to temporarily revert to simulated data while debugging hardware problems, the rollback is simple and immediate.

### Reverting to Simulator Mode

#### Step 1: Change the Spring Profile

In `docker-compose.yml`, switch the profile back:

```yaml
backend:
  environment:
    - SPRING_PROFILES_ACTIVE=simulator
```

Or set the property explicitly:

```yaml
# application.yml
stc:
  iot:
    simulator:
      enabled: true
```

#### Step 2: Restart the Backend

```bash
docker-compose restart backend
```

#### Step 3: Verify

Open the frontend and confirm that simulated sensor data is flowing again. The dashboards should begin updating with synthetic values within a few seconds.

### Important Notes on Rollback

- Physical ESP32 devices can remain powered on during rollback. The platform will accept data from **both** the simulator and real devices simultaneously (the simulator profile does not reject real MQTT messages).
- To avoid mixing simulated and real data, either power off the ESP32 devices during rollback or disconnect them from the MQTT broker.
- No database migration or data cleanup is needed. Simulated and real readings coexist in the same tables.

---

## 8. Security Considerations

### MQTT Authentication

- **Always enable authentication** on the Mosquitto broker for production deployments.
- Use **separate credentials** for the backend service (`stc_backend`) and ESP32 devices (`stc_device`). This allows revoking device access without affecting the backend.
- **Rotate passwords periodically**. Update `mosquitto_passwd`, then update the backend configuration and reflash ESP32 firmware with new credentials.
- Consider using **per-device credentials** for larger deployments, allowing individual device revocation.

### Network Segmentation

- Place ESP32 devices on a **dedicated IoT VLAN** or subnet, isolated from the corporate network and user devices.
- Use firewall rules to restrict ESP32 devices to communicating **only** with the Mosquitto broker on port 1883. They should not have access to the backend, database, or internet.
- The Mosquitto broker should be accessible from both the IoT subnet (for devices) and the application subnet (for the Spring Boot backend).
- Consider placing the broker in a **DMZ** between the IoT and application networks.

### Firmware Security

- **Do not hardcode credentials in production firmware** if possible. For advanced deployments, consider a provisioning system where credentials are loaded at first boot.
- Keep firmware versions tracked in the platform. When updating firmware, increment the version number and update the device registration.
- For over-the-air (OTA) updates in future iterations, ensure firmware images are **signed and verified** before installation.
- Disable the ESP32 **JTAG debug interface** in production to prevent unauthorized firmware extraction.

### Data in Transit

- For environments requiring encryption, configure Mosquitto to use **TLS on port 8883**:
  ```conf
  listener 8883
  cafile /etc/mosquitto/certs/ca.crt
  certfile /etc/mosquitto/certs/server.crt
  keyfile /etc/mosquitto/certs/server.key
  ```
- Update the backend `mqtt.broker-url` to `ssl://mosquitto:8883`.
- Flash ESP32 firmware with the CA certificate for TLS verification.

### Physical Security

- Mount ESP32 devices in **tamper-resistant enclosures** to prevent physical access to USB ports and serial interfaces.
- Place RFID readers in **supervised locations** to prevent unauthorized badge cloning or reader manipulation.
- Label all deployed devices with their device ID and assigned room for easy identification during maintenance.

---

**End of Hardware Integration Guide**

_For firmware specifications, pin mappings, wiring diagrams, and complete ESP32 source code, refer to `ESP32_FIRMWARE_SPEC.md`._
