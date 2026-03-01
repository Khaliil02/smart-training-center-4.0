export interface CoursDto {
  id: number;
  titre: string;
  description: string;
  contenu: string;
  filiere: string;
  niveau: string;
  dureeEstimee: number;
  estActif: boolean;
  statut: string;
  enseignantId: number;
  enseignantNom: string;
  salleId: number;
  salleNom: string;
  nombreInscrits: number;
}

export interface CoursRequest {
  titre: string;
  description: string;
  contenu: string;
  filiere: string;
  niveau: string;
  dureeEstimee: number;
  salleId?: number;
}
