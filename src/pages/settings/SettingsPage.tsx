import React from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../../components/common/Badge';
import { 
  Settings, 
  User as UserIcon, 
  Shield, 
  RotateCcw, 
  CheckCircle2, 
  Lock,
  Database
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, resetToInitialData } = useApp();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Paramètres & Profil</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez vos informations personnelles et consultez la matrice des permissions par rôle.
          </p>
        </div>
      </div>

      {/* User Profile Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
          {currentUser.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-50" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xl">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
              <RoleBadge role={currentUser.role} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
            <p className="text-xs font-semibold text-indigo-600 mt-0.5">{currentUser.title} • {currentUser.team}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Taux Journalier Moyen (TJM)</span>
            <span className="text-sm font-extrabold font-mono text-slate-900">{currentUser.dailyRate || 600} € / jour</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Taux Horaire Estimé</span>
            <span className="text-sm font-extrabold font-mono text-slate-900">{currentUser.hourlyRate || 80} € / heure</span>
          </div>
        </div>
      </div>

      {/* Role Matrix Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Matrice des Droits & Habilitations</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Module / Fonctionnalité</th>
                <th className="py-2.5 px-3 text-center">Collaborateur</th>
                <th className="py-2.5 px-3 text-center">Manager</th>
                <th className="py-2.5 px-3 text-center">Administrateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Saisie et modification de ses heures</td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Validation des feuilles de temps d'équipe</td>
                <td className="py-3 px-3 text-center text-slate-300">-</td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Consultation du Suivi Budgétaire</td>
                <td className="py-3 px-3 text-center text-slate-300">-</td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Gestion des Clients & des Missions</td>
                <td className="py-3 px-3 text-center text-slate-300">-</td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-800">Gestion des Utilisateurs & Rôles</td>
                <td className="py-3 px-3 text-center text-slate-300">-</td>
                <td className="py-3 px-3 text-center text-slate-300">-</td>
                <td className="py-3 px-3 text-center text-emerald-600"><CheckCircle2 className="w-4 h-4 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-amber-900">
          <Database className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold">Réinitialisation des Données de Démonstration</h2>
        </div>
        <p className="text-xs text-amber-800">
          Si vous avez modifié ou ajouté des éléments pendant votre test, vous pouvez réinitialiser le système vers le jeu de données prototype d'origine.
        </p>
        <button
          onClick={() => {
            if (confirm('Voulez-vous réinitialiser toutes les données de démonstration vers leur état d\'origine ?')) {
              resetToInitialData();
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser le Prototype
        </button>
      </div>
    </div>
  );
};
