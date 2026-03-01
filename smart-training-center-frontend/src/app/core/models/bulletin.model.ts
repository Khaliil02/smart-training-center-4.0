export interface BulletinDto {
  etudiantId: number;
  etudiantNom: string;
  etudiantPrenom: string;
  matricule: string;
  moyenneGenerale: number;
  lignes: BulletinLigneDto[];
}

export interface BulletinLigneDto {
  coursTitre: string;
  filiere: string;
  noteFinale: number;
  progression: number;
  etat: string;
  coefficient: number;
  notePonderee: number;
}
