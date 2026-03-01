export interface IoTDeviceDto {
  id: number;
  type: string;
  adresseMac: string;
  firmwareVersion: string;
  estEnLigne: boolean;
  valeurMesuree: number;
  dateHeureMesure: string;
  salleId: number;
  salleNom: string;
  lastHeartbeat: DeviceHeartbeatDto;
}

export interface DeviceHeartbeatDto {
  id: number;
  deviceId: string;
  uptime: number;
  freeMemory: number;
  timestamp: string;
}
