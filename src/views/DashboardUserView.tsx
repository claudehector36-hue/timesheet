import React from 'react';
import { StatCard } from '../components/StatCard';
import { Clock, FileSpreadsheet, Plus, Calendar, CheckSquare } from 'lucide-react';
import { User, TimeEntry, AssignedTask } from '../types';

interface DashboardUserViewProps {
  currentUser: User;
  userTimeEntries: TimeEntry[];
  assignedTasks?: AssignedTask[];
  onNavigate: (tab: string) => void;
}

export const DashboardUserView: React.FC<DashboardUserViewProps> = ({
  currentUser,
  userTimeEntries,
  assignedTasks = [],
  onNavigate
}) => {
  const totalHours = userTimeEntries.reduce((sum, te) => sum + te.hours, 0);

  // Filter entries for today, this week, this month
  const todayStr = new Date().toISOString().split('T')[0];
  const todayHours = userTimeEntries.filter(te => te.date === todayStr).reduce((sum, te) => sum + te.hours, 0);

  const pendingTasks = assignedTasks.filter(t => t.assignedToUserId === currentUser.id && t.status !== 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Espace Utilisateur</span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Bonjour, {currentUser.firstName} 👋
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos déclarations de tâches et téléchargez vos relevés d'heures Excel.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('time-entry')}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Saisir une tâche</span>
          </button>

          <button
            onClick={() => onNavigate('export-excel')}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Heures Saisies Aujourd'hui"
          value={`${todayHours} h`}
          subtitle="Saisies de la journée"
          icon={Clock}
        />
        <StatCard
          title="Total Heures Cumulées"
          value={`${totalHours} h`}
          subtitle="Total de votre historique"
          icon={Calendar}
        />
        <StatCard
          title="Tâches Attribuées en Attente"
          value={`${pendingTasks.length}`}
          subtitle="Assignées par l'administrateur"
          icon={CheckSquare}
        />
      </div>

      {/* Split section: Assigned Tasks & Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tâches Attribuées */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Mes Tâches Attribuées</h3>
            <span className="text-xs font-semibold text-slate-500">{pendingTasks.length} à réaliser</span>
          </div>

          {pendingTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Aucune tâche en attente attribuée par l'administrateur.</p>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{task.activity}</h4>
                      <p className="text-[11px] text-slate-500">{task.clientName} &bull; {task.missionName}</p>
                      <p className="text-[11px] text-slate-600 italic mt-1">"{task.description}"</p>
                    </div>
                    <button
                      onClick={() => onNavigate('time-entry')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors cursor-pointer shrink-0 ml-2"
                    >
                      Saisir Temps &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mes Dernières Saisies */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Dernières Tâches Saisies</h3>
            <button
              onClick={() => onNavigate('time-history')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Historique complet &rarr;
            </button>
          </div>

          {userTimeEntries.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Aucune tâche enregistrée.</p>
          ) : (
            <div className="space-y-3">
              {userTimeEntries.slice(-4).reverse().map(te => {
                const statusVal = te.taskStatus || 'Terminé';
                return (
                  <div key={te.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-700">{te.date}</span>
                        {statusVal === 'En attente' && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">🟠 En attente</span>
                        )}
                        {statusVal === 'En cours' && (
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">🔵 En cours</span>
                        )}
                        {statusVal === 'Terminé' && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">🟢 Terminé</span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">{te.clientName} - {te.activity}</p>
                      <p className="text-[11px] text-slate-500 italic truncate max-w-[220px]">"{te.description}"</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-indigo-600 shrink-0 ml-2">{te.hours} h</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
