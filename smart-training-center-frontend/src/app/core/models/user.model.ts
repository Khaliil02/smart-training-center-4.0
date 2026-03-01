export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  roles: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  dateInscription: string;
  etatCompte: string;
  roles: string[];
}
