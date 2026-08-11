import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab, UserRole } from '../../types';
import { 
  LayoutDashboard, 
  Clock, 
  PlusCircle, 
  Briefcase, 
  PieChart, 
  CheckSquare, 
  Users, 
  Building2, 
  UserCheck, 
  Settings, 
  BarChart3,
  ChevronRight,
  Sparkles,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  roles: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { currentUser, activeTab, setActiveTab, timeEntries, missionBudgetSummaries, logout } = useApp();

  // Pending validation count for Manager / Admin
  const pendingCount = timeEntries.filter(te => te.status === 'Soumis').length;
  const alertBudgetCount = missionBudgetSummaries.filter(s => s.status === 'Alerte' || s.status === 'Dépassement').length;

  const navItems: NavItem[] = [
    // Dashboard (all roles, but unique per role in page logic)
    {
      id: 'dashboard',
      label: currentUser.role === 'ADMIN' ? 'Dashboard Global' : currentUser.role === 'MANAGER' ? 'Dashboard Manager' : 'Mon Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MANAGER', 'COLLABORATEUR'],
    },

    // Collaborateur specific
    {
      id: 'my-timesheets',
      label: 'Saisie des temps',
      icon: Clock,
      roles: ['COLLABORATEUR', 'MANAGER', 'ADMIN'],
    },
    {
      id: 'new-entry',
      label: 'Nouvelle saisie',
      icon: PlusCircle,
      roles: ['COLLABORATEUR', 'MANAGER', 'ADMIN'],
    },
    {
      id: 'my-missions',
      label: 'Mes missions',
      icon: Briefcase,
      roles: ['COLLABORATEUR'],
    },

    // Manager / Admin Specific
    {
      id: 'validations',
      label: 'Validation des temps',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : undefined,
      roles: ['MANAGER', 'ADMIN'],
    },
    {
      id: 'budget-tracking',
      label: 'Suivi budgétaire',
      icon: PieChart,
      badge: alertBudgetCount > 0 ? `${alertBudgetCount} alertes` : undefined,
      roles: ['MANAGER', 'ADMIN'],
    },
    {
      id: 'collaborators-synthesis',
      label: 'Synthèse collaborateurs',
      icon: UserCheck,
      roles: ['MANAGER', 'ADMIN'],
    },

    // Admin Core Management
    {
      id: 'clients',
      label: 'Clients',
      icon: Building2,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      id: 'missions',
      label: 'Gestion des missions',
      icon: Briefcase,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      id: 'users',
      label: 'Utilisateurs & Rôles',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      roles: ['ADMIN', 'MANAGER', 'COLLABORATEUR'],
    },
  ];

  // Filter items visible to user's role
  const visibleNavItems = navItems.filter(item => item.roles.includes(currentUser.role));

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand logo in sidebar header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-wide text-base">Timesheet</span>
              <p className="text-[10px] text-slate-400 font-medium">Espace {currentUser.role.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Current user badge card */}
        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block truncate">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menu principal
          </div>
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold' 
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                  <span>{item.label}</span>
                </div>
                
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800/80 mt-2">
            <button
              onClick={() => {
                onCloseMobile();
                logout();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all group"
            >
              <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          <p className="font-medium text-slate-400">Application Timesheet SaaS</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Version 2.4 • Prototype Excel sync</p>
        </div>
      </aside>
    </>
  );
};
