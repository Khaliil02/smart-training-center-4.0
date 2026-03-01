export interface AlerteDto {
  id: number;
  type: string;
  message: string;
  dateHeure: string;
  statut: string;
  source: string;
  salleId: number;
  salleNom: string;
  capteurId: number;
}
