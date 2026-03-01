#!/usr/bin/env python3
"""
Smart Training Center 4.0 — Standalone Python IoT Simulator
============================================================
Publishes sensor, RFID, heartbeat and device-status messages to an
MQTT broker using the same topic / JSON contract as the real ESP32
hardware deployed in the training centre.

Usage:
    python iot_simulator.py                         # defaults
    python iot_simulator.py --broker 192.168.1.50   # custom broker
    python iot_simulator.py --config my_config.yaml  # custom config
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import random
import signal
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import paho.mqtt.client as mqtt
import yaml

# ────────────────────────────── ANSI colours ──────────────────────────────

class Colors:
    """ANSI escape codes for coloured terminal output."""
    RESET   = "\033[0m"
    RED     = "\033[91m"
    GREEN   = "\033[92m"
    YELLOW  = "\033[93m"
    BLUE    = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN    = "\033[96m"
    WHITE   = "\033[97m"
    BOLD    = "\033[1m"

# ────────────────────────────── Logging setup ─────────────────────────────

LOG_FORMAT = (
    f"{Colors.BOLD}%(asctime)s{Colors.RESET} "
    f"{Colors.CYAN}[SIMULATOR]{Colors.RESET} "
    f"%(levelname)s  %(message)s"
)

logging.basicConfig(level=logging.INFO, format=LOG_FORMAT, datefmt="%H:%M:%S")
logger = logging.getLogger("iot-simulator")

# ────────────────────────────── Helpers ────────────────────────────────────

def iso_now() -> str:
    """Return the current UTC time in ISO 8601 format."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


def load_config(path: str) -> Dict[str, Any]:
    """Load and return the YAML configuration file."""
    config_path = Path(path)
    if not config_path.exists():
        logger.error(f"Configuration file not found: {config_path}")
        sys.exit(1)
    with open(config_path, "r", encoding="utf-8") as fh:
        cfg = yaml.safe_load(fh)
    logger.info(f"{Colors.GREEN}Configuration loaded from {config_path}{Colors.RESET}")
    return cfg

# ────────────────────────────── MQTT callbacks ────────────────────────────

def on_connect(client: mqtt.Client, userdata: Any, flags: dict, rc: int) -> None:
    if rc == 0:
        logger.info(f"{Colors.GREEN}Connected to MQTT broker{Colors.RESET}")
    else:
        logger.warning(f"{Colors.RED}MQTT connection failed (rc={rc}){Colors.RESET}")


def on_disconnect(client: mqtt.Client, userdata: Any, rc: int) -> None:
    if rc != 0:
        logger.warning(
            f"{Colors.YELLOW}Disconnected from broker (rc={rc}), "
            f"will auto-reconnect...{Colors.RESET}"
        )

# ────────────────────────────── Simulator ─────────────────────────────────

class IoTSimulator:
    """Threaded IoT simulator that publishes to MQTT."""

    def __init__(self, config: Dict[str, Any], broker_override: str | None = None,
                 port_override: int | None = None, interval_override: float | None = None):
        self._cfg = config
        self._mqtt_cfg = config["mqtt"]

        # Allow CLI overrides
        if broker_override:
            self._mqtt_cfg["broker"] = broker_override
        if port_override:
            self._mqtt_cfg["port"] = port_override

        self._intervals = config["intervals"]
        if interval_override:
            self._intervals["sensor_interval_sec"] = interval_override

        self._salles: List[Dict] = config["salles"]
        self._rfid_readers: List[Dict] = config["rfid_readers"]
        self._badges: List[str] = config["badges"]
        self._thresholds = config["thresholds"]

        # Build flat device list for heartbeat / status threads
        self._all_devices: List[Dict] = []
        for salle in self._salles:
            for sensor in salle["sensors"]:
                self._all_devices.append({
                    "deviceId": sensor["deviceId"],
                    "mac": sensor["mac"],
                    "firmware": sensor["firmware"],
                    "salleId": salle["id"],
                })

        # Runtime state
        self._start_time = time.time()
        self._device_status: Dict[str, str] = {
            d["deviceId"]: "ONLINE" for d in self._all_devices
        }
        self._shutdown_event = threading.Event()
        self._client: mqtt.Client | None = None
        self._threads: List[threading.Thread] = []

    # ── MQTT connection ───────────────────────────────────────────────

    def _connect_mqtt(self) -> mqtt.Client:
        client = mqtt.Client(client_id=self._mqtt_cfg["client_id"], clean_session=True)
        client.on_connect = on_connect
        client.on_disconnect = on_disconnect

        # Optional credentials
        username = self._mqtt_cfg.get("username", "")
        password = self._mqtt_cfg.get("password", "")
        if username:
            client.username_pw_set(username, password)

        # Auto-reconnect
        client.reconnect_delay_set(min_delay=1, max_delay=30)

        broker = self._mqtt_cfg["broker"]
        port = int(self._mqtt_cfg["port"])
        logger.info(f"Connecting to MQTT broker at {Colors.BOLD}{broker}:{port}{Colors.RESET} ...")
        client.connect(broker, port, keepalive=60)
        client.loop_start()
        return client

    # ── Publishing helpers ────────────────────────────────────────────

    def _publish(self, topic: str, payload: dict, color: str = Colors.WHITE) -> None:
        """Serialize *payload* to JSON and publish to *topic*."""
        if self._client is None:
            return
        msg = json.dumps(payload)
        self._client.publish(topic, msg, qos=1)
        logger.info(f"{color}{topic}{Colors.RESET}  {msg}")

    # ── Value generators ──────────────────────────────────────────────

    def _gen_temperature(self) -> float:
        """Normal range with ~10 % chance of exceeding thresholds."""
        t_min = self._thresholds["temperature_normal_min"]
        t_max = self._thresholds["temperature_normal_max"]
        if random.random() < 0.10:
            # Abnormal: high temperature (> 30)
            return round(random.uniform(30.0, 40.0), 1)
        return round(random.uniform(t_min, t_max), 1)

    def _gen_co2(self) -> int:
        """Normal range with ~10 % chance of exceeding thresholds."""
        c_min = self._thresholds["co2_normal_min"]
        c_max = self._thresholds["co2_normal_max"]
        if random.random() < 0.10:
            # Abnormal: high CO2 (> 1000)
            return random.randint(1000, 2000)
        return random.randint(c_min, c_max)

    def _gen_presence(self) -> tuple[int, bool]:
        """Return (count, detected) pair."""
        count = random.randint(0, 35)
        return count, count > 0

    # ── Thread: sensor data ───────────────────────────────────────────

    def _sensor_loop(self) -> None:
        """Publish temperature, CO2 and presence for every salle."""
        interval = self._intervals["sensor_interval_sec"]
        logger.info(f"{Colors.MAGENTA}Sensor thread started (interval={interval}s){Colors.RESET}")

        while not self._shutdown_event.is_set():
            for salle in self._salles:
                salle_id = salle["id"]
                for sensor in salle["sensors"]:
                    sensor_type = sensor["type"]
                    sensor_id = sensor["sensorId"]

                    if sensor_type == "temperature":
                        value = self._gen_temperature()
                        topic = f"stc/salle/{salle_id}/temperature"
                        payload = {
                            "sensorId": sensor_id,
                            "value": value,
                            "unit": "\u00b0C",
                            "timestamp": iso_now(),
                        }
                        color = Colors.RED if value > 30 else Colors.GREEN

                    elif sensor_type == "co2":
                        value = self._gen_co2()
                        topic = f"stc/salle/{salle_id}/co2"
                        payload = {
                            "sensorId": sensor_id,
                            "value": value,
                            "unit": "ppm",
                            "timestamp": iso_now(),
                        }
                        color = Colors.RED if value > 1000 else Colors.BLUE

                    elif sensor_type == "presence":
                        count, detected = self._gen_presence()
                        topic = f"stc/salle/{salle_id}/presence"
                        payload = {
                            "sensorId": sensor_id,
                            "count": count,
                            "detected": detected,
                            "timestamp": iso_now(),
                        }
                        color = Colors.CYAN
                    else:
                        continue

                    self._publish(topic, payload, color)

            self._shutdown_event.wait(interval)

    # ── Thread: RFID scans ────────────────────────────────────────────

    def _rfid_loop(self) -> None:
        """Randomly generate RFID badge scans (~30 % chance per cycle)."""
        interval = self._intervals["rfid_scan_interval_sec"]
        logger.info(f"{Colors.MAGENTA}RFID thread started (interval={interval}s){Colors.RESET}")

        while not self._shutdown_event.is_set():
            if random.random() < 0.30:
                reader = random.choice(self._rfid_readers)
                badge = random.choice(self._badges)
                topic = f"stc/rfid/{reader['readerId']}/scan"
                payload = {
                    "badgeCode": badge,
                    "readerId": reader["readerId"],
                    "timestamp": iso_now(),
                }
                self._publish(topic, payload, Colors.YELLOW)

            self._shutdown_event.wait(interval)

    # ── Thread: heartbeat ─────────────────────────────────────────────

    def _heartbeat_loop(self) -> None:
        """Publish heartbeat for every device with incrementing uptime."""
        interval = self._intervals["heartbeat_interval_sec"]
        logger.info(f"{Colors.MAGENTA}Heartbeat thread started (interval={interval}s){Colors.RESET}")

        while not self._shutdown_event.is_set():
            uptime = int(time.time() - self._start_time)
            for dev in self._all_devices:
                device_id = dev["deviceId"]
                # Only heartbeat if device is ONLINE
                if self._device_status.get(device_id) != "ONLINE":
                    continue
                topic = f"stc/device/{device_id}/heartbeat"
                payload = {
                    "deviceId": device_id,
                    "uptime": uptime,
                    "freeMemory": random.randint(30000, 60000),
                    "timestamp": iso_now(),
                }
                self._publish(topic, payload, Colors.WHITE)

            self._shutdown_event.wait(interval)

    # ── Thread: device status ─────────────────────────────────────────

    def _status_loop(self) -> None:
        """Occasionally mark a random device OFFLINE then bring it back."""
        interval = self._intervals["heartbeat_interval_sec"]
        logger.info(f"{Colors.MAGENTA}Status thread started (interval={interval}s){Colors.RESET}")

        while not self._shutdown_event.is_set():
            for dev in self._all_devices:
                device_id = dev["deviceId"]
                if random.random() < 0.05 and self._device_status[device_id] == "ONLINE":
                    # Take device OFFLINE
                    self._device_status[device_id] = "OFFLINE"
                    topic = f"stc/device/{device_id}/status"
                    payload = {
                        "deviceId": device_id,
                        "status": "OFFLINE",
                        "firmware": dev["firmware"],
                        "mac": dev["mac"],
                        "timestamp": iso_now(),
                    }
                    self._publish(topic, payload, Colors.RED)

                    # Schedule bringing it back ONLINE after a short delay
                    threading.Timer(
                        random.uniform(3, 8),
                        self._bring_online,
                        args=(dev,),
                    ).start()

            self._shutdown_event.wait(interval)

    def _bring_online(self, dev: Dict) -> None:
        """Publish ONLINE status for a device that was temporarily OFFLINE."""
        if self._shutdown_event.is_set():
            return
        device_id = dev["deviceId"]
        self._device_status[device_id] = "ONLINE"
        topic = f"stc/device/{device_id}/status"
        payload = {
            "deviceId": device_id,
            "status": "ONLINE",
            "firmware": dev["firmware"],
            "mac": dev["mac"],
            "timestamp": iso_now(),
        }
        self._publish(topic, payload, Colors.GREEN)

    # ── Lifecycle ─────────────────────────────────────────────────────

    def start(self) -> None:
        """Connect to the broker and launch all publisher threads."""
        self._client = self._connect_mqtt()
        # Allow connection to establish
        time.sleep(1)

        # Publish initial ONLINE status for all devices
        for dev in self._all_devices:
            topic = f"stc/device/{dev['deviceId']}/status"
            payload = {
                "deviceId": dev["deviceId"],
                "status": "ONLINE",
                "firmware": dev["firmware"],
                "mac": dev["mac"],
                "timestamp": iso_now(),
            }
            self._publish(topic, payload, Colors.GREEN)

        thread_targets = [
            ("sensor-data", self._sensor_loop),
            ("rfid-scan", self._rfid_loop),
            ("heartbeat", self._heartbeat_loop),
            ("device-status", self._status_loop),
        ]

        for name, target in thread_targets:
            t = threading.Thread(target=target, name=name, daemon=True)
            t.start()
            self._threads.append(t)

        logger.info(
            f"{Colors.BOLD}{Colors.GREEN}"
            f"Simulator running — publishing to {self._mqtt_cfg['broker']}:{self._mqtt_cfg['port']}"
            f"{Colors.RESET}"
        )

    def stop(self) -> None:
        """Gracefully shut down all threads and disconnect."""
        logger.info(f"{Colors.YELLOW}Shutting down simulator...{Colors.RESET}")
        self._shutdown_event.set()

        for t in self._threads:
            t.join(timeout=5)

        if self._client:
            self._client.loop_stop()
            self._client.disconnect()

        logger.info(f"{Colors.GREEN}Simulator stopped.{Colors.RESET}")


# ────────────────────────────── CLI entry point ───────────────────────────

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Smart Training Center 4.0 — IoT Simulator"
    )
    parser.add_argument(
        "--config",
        default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.yaml"),
        help="Path to YAML configuration file (default: config.yaml next to this script)",
    )
    parser.add_argument("--broker", default=None, help="MQTT broker host (overrides config)")
    parser.add_argument("--port", type=int, default=None, help="MQTT broker port (overrides config)")
    parser.add_argument(
        "--interval",
        type=float,
        default=None,
        help="Sensor publish interval in seconds (overrides config)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config = load_config(args.config)

    simulator = IoTSimulator(
        config,
        broker_override=args.broker,
        port_override=args.port,
        interval_override=args.interval,
    )

    # Graceful shutdown on Ctrl-C / SIGTERM
    def _signal_handler(sig: int, frame: Any) -> None:
        simulator.stop()
        sys.exit(0)

    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    simulator.start()

    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        simulator.stop()


if __name__ == "__main__":
    banner = f"""
{Colors.BOLD}{Colors.CYAN}
  ____  _____  ____   _  _    ___
 / ___||_   _|/ ___| | || |  / _ \\
 \\___ \\  | | | |     | || |_| | | |
  ___) | | | | |___  |__   _| |_| |
 |____/  |_|  \\____|    |_|(_)___/

  Smart Training Center 4.0 — IoT Simulator
{Colors.RESET}"""
    print(banner)
    main()
