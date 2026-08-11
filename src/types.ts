export type UserRole = 'ADMIN' | 'MANAGER' | 'COLLABORATEUR';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  team: string;
  avatarUrl?: string;
  dailyRate?: number; // TJM in Euros
  hourlyRate?: number;
  active: boolean;
  title: string;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  domain: string;
  contactName: string;
  contactEmail: string;
  status: 'Actif' | 'Inactif';
  colorTag: string;
  notes?: string;
}

export interface Mission {
  id: string;
  clientId: string;
  name: string;
  code: string;
  monthlyBudgetHours: number; // Budget horaire mensuel
  startDate: string;
  endDate?: string;
  status: 'En cours' | 'Terminée' | 'En pause';
  assignedUserIds: string[]; // Collaborateurs associés
  description?: string;
}

export type TaskType = 
  | 'Conseil & Stratégie'
  | 'Développement & Tech'
  | 'Design & UX/UI'
  | 'Gestion de projet'
  | 'Réunion & Cadrage'
  | 'Recette & QA'
  | 'Support & Maintenance'
  | 'Formation & Documentation';

export type TimeEntryStatus = 'Brouillon' | 'Soumis' | 'Validé' | 'Refusé';

export interface TimeEntry {
  id: string;
  userId: string;
  clientId: string;
  missionId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  taskType: TaskType;
  description: string;
  status: TimeEntryStatus;
  rejectionReason?: string;
  validatedByUserId?: string;
  validatedAt?: string;
  createdAt: string;
}

export interface MissionBudgetSummary {
  mission: Mission;
  client: Client;
  budgetHours: number;
  realizedHours: number;
  remainingHours: number;
  consumptionPercentage: number;
  status: 'OK' | 'Alerte' | 'Dépassement'; // OK < 80%, Alerte >= 80%, Dépassement > 100%
}

export interface CollaboratorSummary {
  user: User;
  totalLoggedHours: number;
  validatedHours: number;
  pendingHours: number;
  rejectedHours: number;
  validationRate: number;
  assignedMissionsCount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'my-timesheets'
  | 'new-entry'
  | 'my-missions'
  | 'my-activity'
  | 'team-activity'
  | 'validations'
  | 'budget-tracking'
  | 'collaborators-synthesis'
  | 'clients'
  | 'missions'
  | 'users'
  | 'settings';
