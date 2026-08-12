import React from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  CalendarDays, 
  Users, 
  FileSpreadsheet, 
  CheckSquare,
  LogOut, 
  ChevronRight
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  allUsers?: User[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchUser?: (user: User) => void;
  onLogout: () => void;
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  allUsers = [],
  activeTab,
  setActiveTab,
  onSwitchUser,
  onLogout
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  const userNavItems = [
    { id: 'dashboard-user', label: 'Mon Dashboard', icon: LayoutDashboard },
    { id: 'time-entry', label: 'Saisie de Tâche', icon: Clock },
    { id: 'time-history', label: 'Mes Tâches & Historique', icon: CalendarDays },
    { id: 'export-excel', label: 'Exporter mon Timesheet', icon: FileSpreadsheet },
  ];

  const adminNavItems = [
    { id: 'dashboard-admin', label: 'Dashboard Admin', icon: LayoutDashboard },
    { id: 'global-timesheet', label: 'Timesheet Global', icon: FileSpreadsheet },
    { id: 'task-assignment', label: 'Attribuer une Tâche', icon: CheckSquare },
    { id: 'users-mgmt', label: 'Gestion des Utilisateurs', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs tracking-tighter shadow-md shadow-indigo-500/20">
          STK
        </div>
        <div>
          <h1 className="font-bold text-base text-white tracking-tight">STK-TIMESHEET</h1>
          <p className="text-xs text-slate-400 font-medium">Gestion des Tâches & Timesheets</p>
        </div>
      </div>

      {/* User Info Card */}
      <div className="px-4 py-3.5 bg-slate-800/60 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Compte Connecté</span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
            currentUser.role === 'ADMIN' ? 'bg-purple-900/80 text-purple-200 border border-purple-700/60' :
            'bg-emerald-900/80 text-emerald-200 border border-emerald-700/60'
          }`}>
            {currentUser.role === 'ADMIN' ? 'ADMINISTRATEUR' : 'UTILISATEUR'}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700 shadow-xs shrink-0">
            {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-white truncate">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>

        {/* Optional Admin user select for testing */}
        {isAdmin && allUsers.length > 1 && onSwitchUser && (
          <div className="mt-2.5 pt-2 border-t border-slate-800">
            <label className="text-[10px] text-slate-400 block mb-1 font-medium">Changer d'utilisateur (Admin) :</label>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const selected = allUsers.find(u => u.id === e.target.value);
                if (selected) onSwitchUser(selected);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* User Space Section */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Espace Utilisateur
          </div>
          <nav className="space-y-1">
            {userNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Espace Administrateur</span>
              <span className="text-[10px] bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                ADMIN
              </span>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' 
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer & Logout */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-3">
        <button
          onClick={onLogout}
          className="w-full bg-slate-800/80 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700/80 hover:border-rose-700/60 rounded-xl px-3 py-2.5 font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Se déconnecter</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <p className="font-medium text-slate-400">STK-TIMESHEET v2.0</p>
          <p className="text-[10px]">Session Sécurisée</p>
        </div>
      </div>
    </aside>
  );
};
