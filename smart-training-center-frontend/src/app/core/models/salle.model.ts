export interface SalleDto {
  id: number;
  nomSalle: string;
  capacite: number;
  type: string;
  capteurs: CapteurIoTDto[];
}

export interface SalleRequest {
  nomSalle: string;
  capacite: number;
  type: string;
}

export interface CapteurIoTDto {
  id: number;
  type: string;
  valeurMesuree: number;
  dateHeureMesure: string;
  estEnLigne: boolean;
  firmwareVersion: string;
  adresseMac: string;
  salleId: number;
  salleNom: string;
}

export interface CapteurIoTRequest {
  type: string;
  adresseMac: string;
  firmwareVersion: string;
  salleId: number;
}

export interface EnvironnementDto {
  salleId: number;
  salleNom: string;
  temperature: number | null;
  temperatureTimestamp: string | null;
  co2: number | null;
  co2Timestamp: string | null;
  presenceCount: number | null;
  presenceTimestamp: string | null;
}
