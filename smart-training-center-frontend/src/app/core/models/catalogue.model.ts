export interface FiliereDto {
  id: number;
  nom: string;
  description: string;
  niveau: string;
  specialites: SpecialiteDto[];
}

export interface FiliereRequest {
  nom: string;
  description: string;
  niveau: string;
}

export interface SpecialiteDto {
  id: number;
  nom: string;
  filiereId: number;
  filiereNom: string;
  matieres: MatiereDto[];
}

export interface SpecialiteRequest {
  nom: string;
  filiereId: number;
}

export interface MatiereDto {
  id: number;
  nom: string;
  coefficient: number;
  specialiteId: number;
  specialiteNom: string;
}

export interface MatiereRequest {
  nom: string;
  coefficient: number;
  specialiteId: number;
}

export interface CertificationDto {
  id: number;
  nom: string;
  description: string;
  dateExpiration: string;
}

export interface CertificationRequest {
  nom: string;
  description: string;
  dateExpiration: string;
}
