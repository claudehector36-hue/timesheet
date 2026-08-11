import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { TimeEntryModal } from '../../components/timesheet/TimeEntryModal';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Briefcase, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const CollaborateurDashboard: React.FC = () => {
  const { 
    currentUser, 
    timeEntries, 
    missions, 
    clients, 
    setActiveTab, 
    missionBudgetSummaries 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // User's own time entries
  const userEntries = timeEntries.filter(te => te.userId === currentUser.id);

  // Calculate monthly stats
  const totalHours = userEntries.reduce((sum, te) => sum + te.hours, 0);
  const validatedHours = userEntries.filter(te => te.status === 'Validé').reduce((sum, te) => sum + te.hours, 0);
  const pendingHours = userEntries.filter(te => te.status === 'Soumis').reduce((sum, te) => sum + te.hours, 0);
  const rejectedEntries = userEntries.filter(te => te.status === 'Refusé');

  // Assigned missions for this user
  const userMissions = missions.filter(m => m.assignedUserIds.includes(currentUser.id));

  // Format hours as e.g. "32h30" or "28h"
  const formatHoursStr = (h: number) => {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    return mins > 0 ? `${whole}h${mins < 10 ? '0' : ''}${mins}` : `${whole}h`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20 text-xs font-semibold mb-2">
              <Clock className="w-3.5 h-3.5" /> Espace Collaborateur
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bonjour, {currentUser.name}
            </h1>
            <p className="text-indigo-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Suivez vos heures saisies, consultez vos validations et déclarez vos activités de la semaine.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm shadow-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            Nouvelle Saisie de Temps
          </button>
        </div>
      </div>

      {/* Rejected Alert Banner if any */}
      {rejectedEntries.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Attention : </span>
            Vous avez {rejectedEntries.length} saisie(s) refusée(s) nécessitant votre attention.
            <div className="mt-2 space-y-1">
              {rejectedEntries.map(re => (
                <div key={re.id} className="bg-white/80 p-2 rounded-lg border border-rose-200 text-[11px]">
                  <span className="font-bold">{re.date}</span> - {re.hours}h : <span className="italic">{re.rejectionReason || 'Non précisé'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Heures ce mois"
          value={formatHoursStr(totalHours)}
          subtitle="Total des déclarations"
          icon={Clock}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Validées"
          value={formatHoursStr(validatedHours)}
          subtitle="Heures approuvées"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="En attente"
          value={formatHoursStr(pendingHours)}
          subtitle="En cours de validation"
          icon={AlertCircle}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Missions actives"
          value={userMissions.length}
          subtitle="Projets affectés"
          icon={Briefcase}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Main Grid: Recent Entries & Assigned Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dernières Saisies */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Dernières Saisies de Temps</h2>
              <p className="text-xs text-slate-500">Historique de vos déclarations récentes</p>
            </div>
            <button
              onClick={() => setActiveTab('my-timesheets')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {userEntries.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Aucune saisie enregistrée pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Client & Mission</th>
                    <th className="py-2.5 px-3">Tâche</th>
                    <th className="py-2.5 px-3 text-center">Durée</th>
                    <th className="py-2.5 px-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userEntries.slice(0, 5).map(entry => {
                    const client = clients.find(c => c.id === entry.clientId);
                    const mission = missions.find(m => m.id === entry.missionId);

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                          {entry.date}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-800">{mission?.name || 'Mission'}</p>
                          <p className="text-[11px] text-slate-500">{client?.name || 'Client'}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <p className="font-medium text-slate-700">{entry.taskType}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{entry.description}</p>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {entry.hours} h
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <StatusBadge status={entry.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Mes Missions Affectées */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Mes Missions</h2>
            <p className="text-xs text-slate-500">Missions auxquelles vous participez</p>
          </div>

          <div className="space-y-3">
            {userMissions.map(m => {
              const summary = missionBudgetSummaries.find(s => s.mission.id === m.id);
              const client = clients.find(c => c.id === m.clientId);

              return (
                <div key={m.id} className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        {client?.name}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {m.code}
                    </span>
                  </div>

                  {summary && (
                    <ProgressBar 
                      percentage={summary.consumptionPercentage} 
                      size="sm" 
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Entry Modal */}
      <TimeEntryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
