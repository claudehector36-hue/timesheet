import React from 'react';
import { TimeEntryStatus, UserRole } from '../../types';

interface StatusBadgeProps {
  status: TimeEntryStatus | 'OK' | 'Alerte' | 'Dépassement' | 'Actif' | 'Inactif' | 'En cours' | 'Terminée' | 'En pause';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Validé':
    case 'OK':
    case 'Actif':
      colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-1 ring-emerald-600/10';
      break;
    case 'Soumis':
    case 'Alerte':
    case 'En cours':
      colorStyle = 'bg-amber-50 text-amber-800 border-amber-200/60 ring-1 ring-amber-600/10';
      break;
    case 'Refusé':
    case 'Dépassement':
    case 'Inactif':
      colorStyle = 'bg-rose-50 text-rose-700 border-rose-200/60 ring-1 ring-rose-600/10';
      break;
    case 'Brouillon':
    case 'En pause':
    case 'Terminée':
      colorStyle = 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-400/10';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorStyle} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current opacity-80" 
            style={{ 
              backgroundColor: status === 'Validé' || status === 'OK' || status === 'Actif' ? '#10b981' : 
                               status === 'Soumis' || status === 'Alerte' || status === 'En cours' ? '#f59e0b' : 
                               status === 'Refusé' || status === 'Dépassement' || status === 'Inactif' ? '#ef4444' : '#94a3b8' 
            }} 
      />
      {status}
    </span>
  );
};

interface RoleBadgeProps {
  role: UserRole;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  let style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  let label = 'Collaborateur';

  if (role === 'ADMIN') {
    style = 'bg-purple-50 text-purple-700 border-purple-200';
    label = 'Administrateur';
  } else if (role === 'MANAGER') {
    style = 'bg-blue-50 text-blue-700 border-blue-200';
    label = 'Manager';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${style}`}>
      {label}
    </span>
  );
};
