import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Users, 
  PieChart, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { 
    timeEntries, 
    missionBudgetSummaries, 
    collaboratorSummaries, 
    setActiveTab, 
    validateTimeEntry 
  } = useApp();

  // Pending validation items
  const pendingEntries = timeEntries.filter(te => te.status === 'Soumis');

  // Stats
  const totalLogged = timeEntries.reduce((sum, te) => sum + te.hours, 0);
  const totalValidated = timeEntries.filter(te => te.status === 'Validé').reduce((sum, te) => sum + te.hours, 0);
  const totalPending = pendingEntries.reduce((sum, te) => sum + te.hours, 0);

  // Budget alerts
  const alertMissions = missionBudgetSummaries.filter(s => s.status === 'Alerte' || s.status === 'Dépassement');

  return (
    <div className="space-y-6">
      {/* Manager Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
              <CheckSquare className="w-3.5 h-3.5" /> Espace Pilotage & Validation Manager
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tableau de bord Manager
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Supervisez les saisies de votre équipe, validez les temps et contrôlez la consommation des budgets missions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('validations')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              <CheckSquare className="w-4 h-4" />
              Valider les Temps ({pendingEntries.length})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saisies en attente"
          value={`${pendingEntries.length} demande(s)`}
          subtitle={`${totalPending}h à valider`}
          icon={CheckSquare}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => setActiveTab('validations')}
        />
        <StatCard
          title="Heures de l'équipe"
          value={`${totalLogged} h`}
          subtitle="Cumul toutes missions"
          icon={Clock}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          title="Heures Validées"
          value={`${totalValidated} h`}
          subtitle="Validations effectuées"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Budget en Alerte"
          value={alertMissions.length}
          subtitle="Missions ≥80% consommation"
          icon={ShieldAlert}
          iconBgColor="bg-rose-50"
          iconColor="text-rose-600"
          onClick={() => setActiveTab('budget-tracking')}
        />
      </div>

      {/* Main Grid: Pending Validation Queue & Budget Alert Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: File d'attente des validations */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Demandes de Validation Récents</h2>
              <p className="text-xs text-slate-500">Heures saisies en attente de votre approbation</p>
            </div>
            <button
              onClick={() => setActiveTab('validations')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Gérer la file complète ({pendingEntries.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {pendingEntries.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              Toutes les saisies de temps sont actuellement validées !
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEntries.slice(0, 4).map(entry => {
                return (
                  <div key={entry.id} className="p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {entry.userId.toUpperCase().replace('U-', 'U')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{entry.date}</span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{entry.taskType}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{entry.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {entry.hours} h
                      </span>
                      <button
                        onClick={() => validateTimeEntry(entry.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Alerte Budgets Missions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Alertes Budgétaires</h2>
              <p className="text-xs text-slate-500">Missions sous surveillance</p>
            </div>
            <button
              onClick={() => setActiveTab('budget-tracking')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-3">
            {alertMissions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                Toutes les missions respectent leur budget horaire.
              </div>
            ) : (
              alertMissions.map(s => (
                <div key={s.mission.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{s.client.name}</span>
                      <h4 className="text-xs font-bold text-slate-900">{s.mission.name}</h4>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>

                  <ProgressBar percentage={s.consumptionPercentage} size="sm" />

                  <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono pt-1">
                    <span>Réalisé: <b>{s.realizedHours}h</b> / {s.budgetHours}h</span>
                    <span>Reste: <b className={s.remainingHours === 0 ? 'text-rose-600' : 'text-slate-700'}>{s.remainingHours}h</b></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Collaborators activity summary table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Activité Globale de l'Équipe</h2>
            <p className="text-xs text-slate-500">Synthèse des heures déclarées et validées par membre</p>
          </div>
          <button
            onClick={() => setActiveTab('collaborators-synthesis')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Vue détaillée Synthèse
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Collaborateur</th>
                <th className="py-2.5 px-3">Équipe</th>
                <th className="py-2.5 px-3 text-center">Total Heures</th>
                <th className="py-2.5 px-3 text-center">Validées</th>
                <th className="py-2.5 px-3 text-center">En attente</th>
                <th className="py-2.5 px-3 text-right">Taux Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {collaboratorSummaries.map(summary => (
                <tr key={summary.user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2.5">
                    {summary.user.avatarUrl ? (
                      <img src={summary.user.avatarUrl} alt={summary.user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px]">
                        {summary.user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">{summary.user.name}</p>
                      <p className="text-[10px] text-slate-500">{summary.user.title}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{summary.user.team}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{summary.totalLoggedHours} h</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{summary.validatedHours} h</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">{summary.pendingHours} h</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600">{summary.validationRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
