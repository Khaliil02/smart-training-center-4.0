# Smart Training Center 4.0 -- IoT Simulator

Standalone Python simulator that generates realistic IoT sensor data and publishes it to an MQTT broker. It uses the exact same topics and JSON payload schemas as the real ESP32 hardware deployed in the Smart Training Centre, making it a drop-in replacement for development and testing.

## What it publishes

| Topic pattern                     | Payload fields                                              |
| --------------------------------- | ----------------------------------------------------------- |
| `stc/salle/{salleId}/temperature` | sensorId, value, unit, timestamp                            |
| `stc/salle/{salleId}/co2`         | sensorId, value, unit, timestamp                            |
| `stc/salle/{salleId}/presence`    | sensorId, count, detected, timestamp                        |
| `stc/rfid/{readerId}/scan`        | badgeCode, readerId, timestamp                              |
| `stc/device/{deviceId}/status`    | deviceId, status (ONLINE/OFFLINE), firmware, mac, timestamp |
| `stc/device/{deviceId}/heartbeat` | deviceId, uptime, freeMemory, timestamp                     |

## Prerequisites

- Python 3.8 or later
- An MQTT broker reachable on `localhost:1883` (or wherever you point the config)

## Installation

```bash
cd iot-simulator
pip install -r requirements.txt
```

## Usage

Run with default settings (reads `config.yaml` in the same directory):

```bash
python iot_simulator.py
```

Override specific options via command-line arguments:

```bash
python iot_simulator.py --broker 192.168.1.50 --port 1883 --interval 3
```

All CLI arguments:

| Argument     | Description                                    | Default       |
| ------------ | ---------------------------------------------- | ------------- |
| `--config`   | Path to a YAML configuration file              | `config.yaml` |
| `--broker`   | MQTT broker hostname / IP (overrides config)   | from config   |
| `--port`     | MQTT broker port (overrides config)            | from config   |
| `--interval` | Sensor publish interval in seconds (overrides) | from config   |

Press `Ctrl+C` to stop the simulator gracefully.

## Configuration (config.yaml)

The YAML configuration file defines:

- **mqtt** -- broker connection details (host, port, client ID, optional credentials)
- **salles** -- list of rooms, each with sensor definitions (sensorId, deviceId, type, mac, firmware)
- **rfid_readers** -- RFID reader definitions mapped to rooms
- **intervals** -- how often each thread publishes (sensor, heartbeat, RFID)
- **thresholds** -- normal operating ranges for temperature and CO2 (values outside these ranges are generated ~10% of the time to trigger backend alerts)
- **badges** -- badge codes used for random RFID scan generation

## Simulated behaviour

- **Sensor thread**: publishes temperature, CO2 and presence for all 3 rooms every `sensor_interval_sec` seconds. About 10% of readings exceed normal thresholds (temperature > 30 C, CO2 > 1000 ppm) to exercise the backend alerting pipeline.
- **RFID thread**: every `rfid_scan_interval_sec` seconds there is a ~30% chance of generating a badge scan at a random reader.
- **Heartbeat thread**: every `heartbeat_interval_sec` seconds, publishes heartbeat data (uptime, free memory) for all 9 devices.
- **Status thread**: each cycle, every device has a ~5% chance of going OFFLINE for a few seconds before automatically coming back ONLINE.

## Switching to real hardware

To transition from the simulator to physical ESP32 devices:

1. Stop the simulator (`Ctrl+C`).
2. Connect your ESP32 devices to the same MQTT broker.
3. The ESP32 firmware publishes to the same topics with the same JSON schemas, so the backend requires no changes.

The backend distinguishes simulated vs. real data by the MQTT client ID prefix, not by the payload content.
