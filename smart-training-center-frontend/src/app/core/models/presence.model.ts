export interface PresenceDto {
  id: number;
  dateHeure: string;
  methode: string;
  source: string;
  etudiantId: number;
  etudiantNom: string;
  etudiantMatricule: string;
  salleId: number;
  salleNom: string;
}

export interface ScanRequest {
  badgeCode: string;
  salleId: number;
  methode: string;
  source?: string;
}
