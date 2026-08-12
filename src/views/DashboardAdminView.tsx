import React from 'react';
import { StatCard } from '../components/StatCard';
import { Users, Clock, FileSpreadsheet, CheckSquare, AlertCircle, PlayCircle, CheckCircle2 } from 'lucide-react';
import { User, TimeEntry, AssignedTask, TaskStatus } from '../types';

interface DashboardAdminViewProps {
  users: User[];
  timeEntries: TimeEntry[];
  assignedTasks?: AssignedTask[];
  onNavigate: (tab: string) => void;
}

export const DashboardAdminView: React.FC<DashboardAdminViewProps> = ({
  users,
  timeEntries,
  assignedTasks = [],
  onNavigate
}) => {
  const totalLoggedHours = timeEntries.reduce((sum, te) => sum + te.hours, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayHours = timeEntries.filter(te => te.date === todayStr).reduce((sum, te) => sum + te.hours, 0);

  // Status breakdown from TimeEntries
  const pendingCount = timeEntries.filter(te => te.taskStatus === 'En attente').length;
  const inProgressCount = timeEntries.filter(te => te.taskStatus === 'En cours').length;
  const completedCount = timeEntries.filter(te => (te.taskStatus || 'Terminé') === 'Terminé').length;

  const renderStatusBadge = (statusVal?: TaskStatus) => {
    const val = statusVal || 'Terminé';
    if (val === 'En attente') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          🟠 En attente
        </span>
      );
    }
    if (val === 'En cours') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          🔵 En cours
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        🟢 Terminé
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-full border border-indigo-500/30 font-medium mb-2">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tableau de Bord Administrateur</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Suivi des Tâches & Timesheets</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Consultez l'activité des utilisateurs, le statut d'avancement des tâches et téléchargez les Timesheets Excel.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('task-assignment')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Attribuer une tâche
            </button>
            <button
              onClick={() => onNavigate('global-timesheet')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Timesheet Global</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Collaborateurs Actifs"
          value={users.length}
          subtitle="Comptes utilisateurs"
          icon={Users}
        />
        <StatCard
          title="Saisies Aujourd'hui"
          value={`${todayHours.toFixed(1)} h`}
          subtitle="Cumul de la journée"
          icon={Clock}
        />
        <StatCard
          title="Total Heures Cumulées"
          value={`${totalLoggedHours.toFixed(1)} h`}
          subtitle="Toutes saisies confondues"
          icon={Clock}
        />
      </div>

      {/* Task Status Breakdown Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Statuts d'avancement des Tâches</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-800">Tâches en Attente</p>
              <p className="text-2xl font-extrabold text-amber-900 mt-0.5">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-800">Tâches en Cours</p>
              <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{inProgressCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800">Tâches Terminées</p>
              <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">{completedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Dernières Tâches Enregistrées</h3>
          <button
            onClick={() => onNavigate('global-timesheet')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            Consulter le Timesheet Global &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Utilisateur</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Mission / Projet</th>
                <th className="py-2.5 px-3">Activité / Tâche</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
                <th className="py-2.5 px-3 text-right">Durée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeEntries.slice(-8).reverse().map(te => (
                <tr key={te.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 font-bold">{te.date}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{te.userName}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{te.clientName}</td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{te.missionName}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-semibold">{te.activity}</td>
                  <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">{te.description || '-'}</td>
                  <td className="py-2.5 px-3 text-center">{renderStatusBadge(te.taskStatus)}</td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono text-indigo-600">{te.hours} h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
