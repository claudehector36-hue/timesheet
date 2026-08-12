import React from 'react';
import { Clock, Plus, Bell, Shield, Calendar, LogOut } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  currentUser: User;
  onQuickAddEntry?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  currentUser,
  onQuickAddEntry,
  onLogout
}) => {
  const currentDateFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{currentDateFormatted}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {onQuickAddEntry && (
          <button
            onClick={onQuickAddEntry}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Saisir une tâche</span>
          </button>
        )}

        <div className="h-6 w-px bg-slate-200" />

        {/* User Pill */}
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-none">
              {currentUser.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
            </p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Se déconnecter"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
