import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Client, 
  Mission, 
  TimeEntry, 
  AppNotification, 
  NavigationTab,
  MissionBudgetSummary,
  CollaboratorSummary,
  TimeEntryStatus
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_CLIENTS, 
  INITIAL_MISSIONS, 
  INITIAL_TIME_ENTRIES, 
  INITIAL_NOTIFICATIONS 
} from '../data/initialData';

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User;
  users: User[];
  clients: Client[];
  missions: Mission[];
  timeEntries: TimeEntry[];
  notifications: AppNotification[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  verifyAdminPassword: (pass: string) => boolean;
  
  // Time Entries
  addTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'> & { status?: TimeEntryStatus }) => void;
  updateTimeEntry: (entry: TimeEntry) => void;
  deleteTimeEntry: (id: string) => void;
  validateTimeEntry: (id: string) => void;
  rejectTimeEntry: (id: string, reason: string) => void;
  bulkValidateTimeEntries: (ids: string[]) => void;
  
  // Clients
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  
  // Missions
  addMission: (mission: Omit<Mission, 'id'>) => void;
  updateMission: (mission: Mission) => void;
  
  // Users
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  toggleUserStatus: (id: string) => void;
  
  // Notifications & Reset
  markNotificationRead: (id: string) => void;
  resetToInitialData: () => void;
  
  // Computed Summaries
  missionBudgetSummaries: MissionBudgetSummary[];
  collaboratorSummaries: CollaboratorSummary[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ts_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem('ts_current_user_id');
    const found = users.find(u => u.id === savedId);
    return found || users[0] || INITIAL_USERS[0];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem('ts_is_authenticated');
    return savedAuth !== null ? savedAuth === 'true' : true;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('ts_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem('ts_missions');
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('ts_time_entries');
    return saved ? JSON.parse(saved) : INITIAL_TIME_ENTRIES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('ts_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('ts_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ts_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('ts_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('ts_time_entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    localStorage.setItem('ts_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ts_current_user_id', currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ts_is_authenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  // Login handler
  const login = (email: string, pass: string) => {
    const target = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    
    if (!target) {
      return { success: false, error: 'Aucun compte trouvé pour cette adresse email.' };
    }

    if (!target.active) {
      return { success: false, error: 'Ce compte utilisateur est actuellement désactivé.' };
    }

    // Default password logic if user has password set or default fallback
    const expectedPassword = target.password || (target.role === 'ADMIN' ? 'admin123' : target.role === 'MANAGER' ? 'manager123' : 'user123');

    if (pass !== expectedPassword) {
      return { success: false, error: 'Mot de passe incorrect.' };
    }

    setCurrentUser(target);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    return { success: true };
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Check admin password for switcher / protected actions
  const verifyAdminPassword = (pass: string) => {
    const adminUser = users.find(u => u.role === 'ADMIN') || INITIAL_USERS[0];
    const expectedPassword = adminUser.password || 'admin123';
    return pass === expectedPassword;
  };

  // Adjust default tab when switching role if current tab is forbidden
  const switchUser = (userId: string) => {
    const selected = users.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      // Reset active tab to dashboard on user change to prevent role mismatch
      setActiveTab('dashboard');
    }
  };

  // Time Entry CRUD
  const addTimeEntry = (entry: Omit<TimeEntry, 'id' | 'createdAt'> & { status?: TimeEntryStatus }) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: `te-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: entry.status || 'Soumis',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTimeEntries(prev => [newEntry, ...prev]);
  };

  const updateTimeEntry = (updated: TimeEntry) => {
    setTimeEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(e => e.id !== id));
  };

  const validateTimeEntry = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setTimeEntries(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'Validé' as TimeEntryStatus,
          validatedByUserId: currentUser.id,
          validatedAt: today,
          rejectionReason: undefined,
        };
      }
      return e;
    }));
  };

  const rejectTimeEntry = (id: string, reason: string) => {
    setTimeEntries(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          status: 'Refusé' as TimeEntryStatus,
          rejectionReason: reason,
        };
      }
      return e;
    }));
  };

  const bulkValidateTimeEntries = (ids: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    setTimeEntries(prev => prev.map(e => {
      if (ids.includes(e.id)) {
        return {
          ...e,
          status: 'Validé' as TimeEntryStatus,
          validatedByUserId: currentUser.id,
          validatedAt: today,
          rejectionReason: undefined,
        };
      }
      return e;
    }));
  };

  // Client CRUD
  const addClient = (c: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...c,
      id: `c-${Date.now()}`,
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (c: Client) => {
    setClients(prev => prev.map(item => item.id === c.id ? c : item));
  };

  // Mission CRUD
  const addMission = (m: Omit<Mission, 'id'>) => {
    const newMission: Mission = {
      ...m,
      id: `m-${Date.now()}`,
    };
    setMissions(prev => [...prev, newMission]);
  };

  const updateMission = (m: Mission) => {
    setMissions(prev => prev.map(item => item.id === m.id ? m : item));
  };

  // User CRUD
  const addUser = (u: Omit<User, 'id'>) => {
    const newUser: User = {
      ...u,
      id: `u-${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (u: User) => {
    setUsers(prev => prev.map(item => item.id === u.id ? u : item));
    if (currentUser.id === u.id) {
      setCurrentUser(u);
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const resetToInitialData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setClients(INITIAL_CLIENTS);
    setMissions(INITIAL_MISSIONS);
    setTimeEntries(INITIAL_TIME_ENTRIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.clear();
  };

  // Computed: Suivi Budgétaire
  const missionBudgetSummaries = useMemo<MissionBudgetSummary[]>(() => {
    return missions.map(mission => {
      const client = clients.find(c => c.id === mission.clientId) || {
        id: 'c-unknown',
        name: 'Client Inconnu',
        code: 'N/A',
        domain: '-',
        contactName: '-',
        contactEmail: '-',
        status: 'Actif',
        colorTag: '#64748b',
      };

      // Sum all validated & submitted hours for this mission
      const realizedHours = timeEntries
        .filter(te => te.missionId === mission.id && (te.status === 'Validé' || te.status === 'Soumis'))
        .reduce((sum, te) => sum + te.hours, 0);

      const budgetHours = mission.monthlyBudgetHours || 1;
      const remainingHours = Math.max(0, budgetHours - realizedHours);
      const consumptionPercentage = Math.round((realizedHours / budgetHours) * 100);

      let status: 'OK' | 'Alerte' | 'Dépassement' = 'OK';
      if (consumptionPercentage > 100) {
        status = 'Dépassement';
      } else if (consumptionPercentage >= 80) {
        status = 'Alerte';
      }

      return {
        mission,
        client,
        budgetHours,
        realizedHours,
        remainingHours,
        consumptionPercentage,
        status,
      };
    });
  }, [missions, clients, timeEntries]);

  // Computed: Synthèse Collaborateurs
  const collaboratorSummaries = useMemo<CollaboratorSummary[]>(() => {
    return users.map(user => {
      const userEntries = timeEntries.filter(te => te.userId === user.id);
      
      const totalLoggedHours = userEntries.reduce((sum, te) => sum + te.hours, 0);
      const validatedHours = userEntries
        .filter(te => te.status === 'Validé')
        .reduce((sum, te) => sum + te.hours, 0);
      const pendingHours = userEntries
        .filter(te => te.status === 'Soumis')
        .reduce((sum, te) => sum + te.hours, 0);
      const rejectedHours = userEntries
        .filter(te => te.status === 'Refusé')
        .reduce((sum, te) => sum + te.hours, 0);

      const validationRate = totalLoggedHours > 0 
        ? Math.round((validatedHours / totalLoggedHours) * 100) 
        : 100;

      const assignedMissionsCount = missions.filter(m => m.assignedUserIds.includes(user.id)).length;

      return {
        user,
        totalLoggedHours,
        validatedHours,
        pendingHours,
        rejectedHours,
        validationRate,
        assignedMissionsCount,
      };
    });
  }, [users, timeEntries, missions]);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        users,
        clients,
        missions,
        timeEntries,
        notifications,
        activeTab,
        setActiveTab,
        login,
        logout,
        switchUser,
        verifyAdminPassword,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        validateTimeEntry,
        rejectTimeEntry,
        bulkValidateTimeEntries,
        addClient,
        updateClient,
        addMission,
        updateMission,
        addUser,
        updateUser,
        toggleUserStatus,
        markNotificationRead,
        resetToInitialData,
        missionBudgetSummaries,
        collaboratorSummaries,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
