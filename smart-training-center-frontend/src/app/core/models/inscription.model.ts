export interface InscriptionCoursDto {
  id: number;
  dateInscription: string;
  progression: number;
  noteFinale: number;
  etat: string;
  dateDernierAcces: string;
  etudiantId: number;
  etudiantMatricule: string;
  etudiantNom: string;
  coursId: number;
  coursTitre: string;
}

export interface ProgressionRequest {
  progression: number;
}
