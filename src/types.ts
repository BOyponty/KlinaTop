export type UserRole = 'admin' | 'rh' | 'agent' | 'superadmin' | 'manager';

export interface RhAdminUser {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  role: 'admin' | 'rh' | 'superadmin' | 'manager';
  poste: string;
  photoUrl?: string;
  initiales?: string;
  motDePasse?: string;
  emailVerified?: boolean;
}

export type EmployeeStatus = 'Actif' | 'Inactif';

export interface User {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: UserRole;
  poste: string;
  equipeId: string;
  equipeNom: string;
  statut: EmployeeStatus;
  photoUrl?: string;
  avatarBg?: string;
  initiales: string;
}

export interface Equipe {
  id: string;
  nom: string;
  horaire: string;
  description: string;
  nombreMembres: number;
}

export type PointageType = 'check-in' | 'check-out';

export interface Pointage {
  id: string;
  userId: string;
  userName: string;
  userPoste: string;
  userPhoto?: string;
  equipeNom: string;
  type: PointageType;
  timestamp: string; // ISO string
  formattedTime: string; // e.g. "07:45"
  formattedDate: string; // e.g. "12/08/2026"
  latitude: number;
  longitude: number;
  adresse: string;
  photoUrl: string;
  siteName: string;
}

export type PresenceStatut = 'présent' | 'absent' | 'en_poste' | 'retard';

export interface Presence {
  id: string;
  userId: string;
  userName: string;
  userPoste: string;
  userPhoto?: string;
  equipeNom: string;
  date: string; // "2026-08-12"
  heureCheckin: string | null; // e.g. "07:45"
  heureCheckout: string | null; // e.g. "16:15"
  duree: string; // e.g. "8h 30m"
  dureeMinutes: number;
  statut: PresenceStatut;
  adresseCheckin?: string;
  adresseCheckout?: string;
  photoCheckinUrl?: string;
  photoCheckoutUrl?: string;
  latCheckin?: number;
  lngCheckin?: number;
}

export interface PayrollExportHistory {
  id: string;
  periode: string; // e.g. "Mai 2026"
  format: 'excel' | 'csv' | 'pdf';
  generePar: string;
  dateGeneration: string;
  totalEmployes: number;
  totalHeures: string;
  fichierUrl?: string;
}