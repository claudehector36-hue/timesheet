import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/auth/LoginPage';

// Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManagerDashboard } from './pages/manager/ManagerDashboard';
import { CollaborateurDashboard } from './pages/collaborateur/CollaborateurDashboard';
import { TimesheetPage } from './pages/timesheet/TimesheetPage';
import { ValidationPage } from './pages/validation/ValidationPage';
import { BudgetTrackingPage } from './pages/budget/BudgetTrackingPage';
import { CollaborateursSynthesisPage } from './pages/collaborateurs/CollaborateursSynthesisPage';
import { ClientsPage } from './pages/clients/ClientsPage';
import { MissionsPage } from './pages/missions/MissionsPage';
import { UsersPage } from './pages/users/UsersPage';
import { SettingsPage } from './pages/settings/SettingsPage';

const AppContent: React.FC = () => {
  const { currentUser, activeTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'ADMIN') return <AdminDashboard />;
        if (currentUser.role === 'MANAGER') return <ManagerDashboard />;
        return <CollaborateurDashboard />;

      case 'my-timesheets':
      case 'new-entry':
        return <TimesheetPage />;

      case 'my-missions':
        return <MissionsPage />;

      case 'my-activity':
        return <CollaborateurDashboard />;

      case 'validations':
        return <ValidationPage />;

      case 'budget-tracking':
        return <BudgetTrackingPage />;

      case 'collaborators-synthesis':
        return <CollaborateursSynthesisPage />;

      case 'clients':
        return <ClientsPage />;

      case 'missions':
        return <MissionsPage />;

      case 'users':
        return <UsersPage />;

      case 'settings':
        return <SettingsPage />;

      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AppLayout>
      {renderCurrentView()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
