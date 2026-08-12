/**
 * Shared Type Definitions for GestiaTimesheet
 */

export type UserRole = 'ADMIN' | 'USER';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  dailyRate: number; // TJM (€)
  weeklyCapacity: number; // e.g. 35
  status: UserStatus;
  avatarUrl?: string;
  passwordHash?: string;
  password?: string; // used for creating/updating password
}

export interface Client {
  id: string;
  code: string;
  name: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export type MissionType = 'REGIE' | 'FORFAIT' | 'INTERNE';
export type MissionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface Mission {
  id: string;
  code: string;
  name: string;
  clientId: string;
  clientName: string;
  type: MissionType;
  startDate: string;
  endDate: string;
  budgetHours: number;
  budgetAmount: number;
  hourlyRate: number;
  status: MissionStatus;
  assignedUserIds: string[];
}

export type TimeEntryStatus = 'APPROVED';

export type TaskStatus = 'En attente' | 'En cours' | 'Terminé';

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  clientId: string;
  clientName: string;
  missionId: string;
  missionName: string;
  activity: string;
  date: string; // YYYY-MM-DD
  hours: number;
  description: string;
  taskStatus: TaskStatus; // 'En attente' | 'En cours' | 'Terminé'
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignedTask {
  id: string;
  assignedToUserId: string;
  assignedToUserName: string;
  assignedByUserId: string;
  clientName: string;
  missionName: string;
  activity: string;
  description: string;
  dueDate?: string;
  estimatedHours?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface TimesheetPeriod {
  id: string;
  userId: string;
  userName: string;
  weekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD (Monday)
  endDate: string;   // YYYY-MM-DD (Sunday)
  status: string;
  totalHours: number;
  submittedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
