import { EnvironnementDto, CapteurIoTDto } from './salle.model';
import { AlerteDto } from './alerte.model';
import { IoTDeviceDto } from './device.model';

export interface DashboardPedagogiqueDto {
  enseignantId: number;
  enseignantNom: string;
  totalCours: number;
  totalEtudiants: number;
  coursStats: CoursStatsDto[];
}

export interface CoursStatsDto {
  coursId: number;
  coursTitre: string;
  nombreInscrits: number;
  progressionMoyenne: number;
  tauxReussite: number;
  noteMoyenne: number;
  totalEvaluations: number;
  tauxPresence: number;
}

export interface DashboardAdministratifDto {
  totalUtilisateurs: number;
  utilisateursParRole: { [role: string]: number };
  totalSalles: number;
  sallesParType: { [type: string]: number };
  devicesOnline: number;
  devicesOffline: number;
  alertesActives: number;
  totalInscriptions: number;
  inscriptionsEnCours: number;
  inscriptionsTerminees: number;
}

export interface DashboardDecisionnelDto {
  tauxReussiteGlobal: number;
  tauxPresenceGlobal: number;
  filiereStats: FiliereStatsDto[];
  indicateursEnvironnementaux: EnvironnementResumeDto[];
}

export interface FiliereStatsDto {
  filiereId: number;
  filiereNom: string;
  totalEtudiants: number;
  tauxReussite: number;
  progressionMoyenne: number;
  specialiteStats: SpecialiteStatsDto[];
}

export interface SpecialiteStatsDto {
  specialiteId: number;
  specialiteNom: string;
  totalEtudiants: number;
  tauxReussite: number;
  progressionMoyenne: number;
}

export interface EnvironnementResumeDto {
  salleId: number;
  salleNom: string;
  temperatureMoyenne: number | null;
  co2Moyen: number | null;
  presenceMoyenne: number | null;
}

export interface DashboardIoTDto {
  salleId: number;
  salleNom: string;
  environnementActuel: EnvironnementDto;
  capteurs: CapteurIoTDto[];
  alertesRecentes: AlerteDto[];
}

export interface FleetStatusDto {
  totalDevices: number;
  devicesOnline: number;
  devicesOffline: number;
  firmwareDistribution: { [version: string]: number };
  deviceParType: { [type: string]: number };
  devices: IoTDeviceDto[];
}

export interface PerformanceDto {
  tauxReussite: number;
  tauxPresence: number;
  progressionMoyenneGlobale: number;
  noteMoyenneGlobale: number;
  totalInscrits: number;
  totalTermines: number;
  totalAbandonnes: number;
  tauxReussiteParFiliere: { [filiere: string]: number };
  engagementParCours: { [cours: string]: number };
}
