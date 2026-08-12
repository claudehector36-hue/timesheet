import React, { useState, useEffect } from 'react';
import { User, TimeEntry, AssignedTask } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast, ToastMessage } from './components/Toast';

import { LoginView } from './views/LoginView';
import { DashboardAdminView } from './views/DashboardAdminView';
import { DashboardUserView } from './views/DashboardUserView';
import { UsersManagementView } from './views/UsersManagementView';
import { TimeEntryView } from './views/TimeEntryView';
import { TimeHistoryView } from './views/TimeHistoryView';
import { ExcelExportView } from './views/ExcelExportView';
import { GlobalTimesheetView } from './views/GlobalTimesheetView';
import { TaskAssignmentView } from './views/TaskAssignmentView';

export default function App() {
  // Auth state
  const [sessionToken, setSessionToken] = useState<string | null>(() => localStorage.getItem('gestia_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // App data state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);

  const [activeTab, setActiveTab] = useState<string>('dashboard-user');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  // Helper for authenticated API calls
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (sessionToken) {
      headers.set('Authorization', `Bearer ${sessionToken}`);
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout();
      showToast('error', 'Session expirée', 'Veuillez vous reconnecter.');
    }
    return res;
  };

  // Check authentication on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('gestia_token');
      if (!storedToken) {
        setIsAuthChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        if (res.ok) {
          const data = await res.json();
          const user = data.user || data;
          setCurrentUser(user);
          setSessionToken(storedToken);

          if (user.role === 'ADMIN') {
            setActiveTab('dashboard-admin');
          } else {
            setActiveTab('dashboard-user');
          }
        } else {
          localStorage.removeItem('gestia_token');
          setSessionToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Error verifying auth session:', err);
        localStorage.removeItem('gestia_token');
        setSessionToken(null);
        setCurrentUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch all application data when user is authenticated
  const refreshAllData = async () => {
    if (!sessionToken) return;

    try {
      const [uRes, teRes, tasksRes] = await Promise.all([
        authFetch('/api/users'),
        authFetch('/api/time-entries'),
        authFetch('/api/tasks')
      ]);

      const [uData, teData, tasksData] = await Promise.all([
        uRes.ok ? uRes.json() : [],
        teRes.ok ? teRes.json() : [],
        tasksRes.ok ? tasksRes.json() : []
      ]);

      setAllUsers(uData);
      setTimeEntries(teData);
      setAssignedTasks(tasksData);

      if (currentUser) {
        const updatedSelf = uData.find((u: User) => u.id === currentUser.id);
        if (updatedSelf) setCurrentUser(updatedSelf);
      }
    } catch (error) {
      console.error('Error refreshing app data:', error);
    }
  };

  useEffect(() => {
    if (sessionToken && currentUser) {
      refreshAllData();
    }
  }, [sessionToken, currentUser?.id]);

  // Auth Handlers
  const handleLogin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Identifiants invalides.' };
      }

      localStorage.setItem('gestia_token', data.token);
      setSessionToken(data.token);
      setCurrentUser(data.user);

      if (data.user.role === 'ADMIN') {
        setActiveTab('dashboard-admin');
      } else {
        setActiveTab('dashboard-user');
      }

      showToast('success', 'Connexion réussie', `Bienvenue ${data.user.firstName} ${data.user.lastName}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Impossible de contacter le serveur de connexion.' };
    }
  };

  const handleLogout = async () => {
    if (sessionToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
      } catch (err) {
        // ignore logout errors
      }
    }

    localStorage.removeItem('gestia_token');
    setSessionToken(null);
    setCurrentUser(null);
    showToast('info', 'Déconnexion', 'Vous avez été déconnecté avec succès.');
  };

  // Switch User (For testing when logged in as Admin)
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setActiveTab('dashboard-admin');
    } else {
      setActiveTab('dashboard-user');
    }
    showToast('info', 'Changement d\'utilisateur', `Connecté en tant que ${user.firstName} ${user.lastName} (${user.role})`);
  };

  // User CRUD
  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const res = await authFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        showToast('success', 'Utilisateur créé', `${userData.firstName} ${userData.lastName} a été ajouté avec succès.`);
        refreshAllData();
      } else {
        const errData = await res.json();
        showToast('error', 'Erreur de création', errData.error || 'Échec de la création');
      }
    } catch (err) {
      showToast('error', 'Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      const res = await authFetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        showToast('success', 'Utilisateur mis à jour');
        refreshAllData();
      } else {
        const errData = await res.json();
        showToast('error', 'Erreur de modification', errData.error || 'Échec de la mise à jour');
      }
    } catch (err) {
      showToast('error', 'Erreur lors de la modification');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await authFetch(`/api/users/${id}?force=true`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Utilisateur supprimé');
        refreshAllData();
      } else {
        const errData = await res.json();
        showToast('error', 'Erreur de suppression', errData.error || 'Impossible de supprimer');
      }
    } catch (err) {
      showToast('error', 'Erreur de suppression');
    }
  };

  // Time Entry CRUD
  const handleSaveTimeEntry = async (entry: Partial<TimeEntry>) => {
    try {
      const res = await authFetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        showToast('success', 'Saisie enregistrée', `${entry.hours}h enregistrées avec succès.`);
        refreshAllData();
      }
    } catch (err) {
      showToast('error', 'Erreur lors de la saisie');
    }
  };

  const handleUpdateTimeEntry = async (id: string, entry: Partial<TimeEntry>) => {
    try {
      const res = await authFetch(`/api/time-entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (res.ok) {
        showToast('success', 'Saisie mise à jour');
        refreshAllData();
      }
    } catch (err) {
      showToast('error', 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteTimeEntry = async (id: string) => {
    try {
      const res = await authFetch(`/api/time-entries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Saisie supprimée');
        refreshAllData();
      }
    } catch (err) {
      showToast('error', 'Erreur de suppression');
    }
  };

  // Task Assignment CRUD
  const handleAssignTask = async (task: Partial<AssignedTask>) => {
    try {
      const res = await authFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      if (res.ok) {
        showToast('success', 'Tâche attribuée', 'La tâche a été assignée à l\'utilisateur.');
        refreshAllData();
      }
    } catch (err) {
      showToast('error', 'Erreur lors de l\'attribution de la tâche');
    }
  };

  const handleDeleteAssignedTask = async (taskId: string) => {
    try {
      const res = await authFetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Tâche supprimée');
        refreshAllData();
      }
    } catch (err) {
      showToast('error', 'Erreur lors de la suppression de la tâche');
    }
  };

  // 1. Loading State
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold tracking-wide">Vérification de la session en cours...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State -> Show Mandatory Login Page
  if (!sessionToken || !currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  // User-specific filtering
  const userTimeEntries = timeEntries.filter(te => te.userId === currentUser.id);
  const isAdmin = currentUser.role === 'ADMIN';

  const renderCurrentView = () => {
    const adminOnlyTabs = ['dashboard-admin', 'global-timesheet', 'task-assignment', 'users-mgmt'];
    if (!isAdmin && adminOnlyTabs.includes(activeTab)) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3 my-8">
          <p className="text-lg font-bold text-amber-900">Accès Réservé aux Administrateurs</p>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            Vous n'avez pas les droits d'administration nécessaires pour consulter cet espace.
          </p>
          <button
            onClick={() => setActiveTab('dashboard-user')}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Retourner à mon Dashboard
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard-admin':
        return (
          <DashboardAdminView
            users={allUsers}
            timeEntries={timeEntries}
            assignedTasks={assignedTasks}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'global-timesheet':
        return (
          <GlobalTimesheetView
            users={allUsers}
            timeEntries={timeEntries}
            sessionToken={sessionToken || ''}
            showToast={showToast}
          />
        );
      case 'task-assignment':
        return (
          <TaskAssignmentView
            users={allUsers}
            assignedTasks={assignedTasks}
            currentUser={currentUser}
            onAssignTask={handleAssignTask}
            onDeleteTask={handleDeleteAssignedTask}
          />
        );
      case 'users-mgmt':
        return (
          <UsersManagementView
            users={allUsers}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'dashboard-user':
        return (
          <DashboardUserView
            currentUser={currentUser}
            userTimeEntries={userTimeEntries}
            assignedTasks={assignedTasks}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'time-entry':
        return (
          <TimeEntryView
            currentUser={currentUser}
            onSaveTimeEntry={handleSaveTimeEntry}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'time-history':
        return (
          <TimeHistoryView
            entries={userTimeEntries}
            currentUser={currentUser}
            onUpdateEntry={handleUpdateTimeEntry}
            onDeleteEntry={handleDeleteTimeEntry}
            onExportExcel={() => setActiveTab('export-excel')}
          />
        );
      case 'export-excel':
        return (
          <ExcelExportView
            currentUser={currentUser}
            userEntries={userTimeEntries}
            sessionToken={sessionToken || ''}
          />
        );
      default:
        return (
          <DashboardUserView
            currentUser={currentUser}
            userTimeEntries={userTimeEntries}
            assignedTasks={assignedTasks}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  const viewTitles: { [key: string]: { title: string; subtitle?: string } } = {
    'dashboard-admin': { title: 'Dashboard Administrateur', subtitle: 'Suivi de l\'activité générale des tâches et timesheets' },
    'global-timesheet': { title: 'Timesheet Global', subtitle: 'Consultation et exportation des Timesheets de tous les utilisateurs' },
    'task-assignment': { title: 'Attribution des Tâches', subtitle: 'Assigner des tâches spécifiques aux utilisateurs' },
    'users-mgmt': { title: 'Gestion des Utilisateurs', subtitle: 'Gestion des comptes et identifiants' },
    'dashboard-user': { title: 'Mon Tableau de Bord', subtitle: 'Aperçu personnel de vos tâches et relevés d\'heures' },
    'time-entry': { title: 'Saisie de Tâche', subtitle: 'Saisissez manuellement vos activités' },
    'time-history': { title: 'Mes Tâches & Historique', subtitle: 'Consulter et rechercher vos tâches' },
    'export-excel': { title: 'Exporter mon Timesheet (.xlsx)', subtitle: 'Génération du rapport Excel officiel' },
  };

  const currentViewMeta = viewTitles[activeTab] || { title: 'STK-TIMESHEET' };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        allUsers={allUsers}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSwitchUser={isAdmin ? handleSwitchUser : undefined}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={currentViewMeta.title}
          subtitle={currentViewMeta.subtitle}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
