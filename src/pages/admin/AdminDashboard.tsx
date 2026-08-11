import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { 
  Users, 
  Building2, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PieChart, 
  PlusCircle,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    clients, 
    missions, 
    timeEntries, 
    missionBudgetSummaries, 
    setActiveTab 
  } = useApp();

  const activeClients = clients.filter(c => c.status === 'Actif');
  const activeMissions = missions.filter(m => m.status === 'En cours');
  const totalLoggedHours = timeEntries.reduce((sum, te) => sum + te.hours, 0);
  const totalValidatedHours = timeEntries.filter(te => te.status === 'Validé').reduce((sum, te) => sum + te.hours, 0);
  const totalPendingHours = timeEntries.filter(te => te.status === 'Soumis').reduce((sum, te) => sum + te.hours, 0);

  // Overall budget consumption
  const totalBudgetedHours = missions.reduce((sum, m) => sum + m.monthlyBudgetHours, 0);
  const overallBudgetPercentage = totalBudgetedHours > 0 
    ? Math.round((totalLoggedHours / totalBudgetedHours) * 100) 
    : 0;

  // Breakdown by client
  const clientHoursMap = clients.map(c => {
    const hours = timeEntries
      .filter(te => te.clientId === c.id)
      .reduce((sum, te) => sum + te.hours, 0);
    return { client: c, hours };
  }).sort((a, b) => b.hours - a.hours);

  return (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Espace Administrateur
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tableau de bord Global Administration
            </h1>
            <p className="text-purple-200/80 text-xs sm:text-sm mt-1 max-w-xl">
              Vision à 360° des collaborateurs, des contrats clients, des budgets d'heures et des indicateurs de performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('users')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xs transition-all"
            >
              + Utilisateur
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-xs transition-all"
            >
              + Client
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              + Mission
            </button>
          </div>
        </div>
      </div>

      {/* Primary Executive Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <StatCard
          title="Collaborateurs"
          value={users.length}
          subtitle="Actifs"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          onClick={() => setActiveTab('users')}
        />
        <StatCard
          title="Clients"
          value={activeClients.length}
          subtitle="Comptes actifs"
          icon={Building2}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
          onClick={() => setActiveTab('clients')}
        />
        <StatCard
          title="Missions"
          value={activeMissions.length}
          subtitle="En cours"
          icon={Briefcase}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          onClick={() => setActiveTab('missions')}
        />
        <StatCard
          title="Heures Saisies"
          value={`${totalLoggedHours}h`}
          subtitle="Cumul total"
          icon={Clock}
          iconBgColor="bg-slate-100"
          iconColor="text-slate-700"
          onClick={() => setActiveTab('my-timesheets')}
        />
        <StatCard
          title="Validées"
          value={`${totalValidatedHours}h`}
          subtitle="Approuvées"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="En attente"
          value={`${totalPendingHours}h`}
          subtitle="À valider"
          icon={AlertCircle}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
          onClick={() => setActiveTab('validations')}
        />
        <StatCard
          title="Budget Consommé"
          value={`${overallBudgetPercentage}%`}
          subtitle={`${totalLoggedHours}h / ${totalBudgetedHours}h`}
          icon={PieChart}
          iconBgColor="bg-teal-50"
          iconColor="text-teal-600"
          onClick={() => setActiveTab('budget-tracking')}
        />
      </div>

      {/* Middle Grid: Client Distribution & Mission Consumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Répartition des heures par client */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Répartition des Heures par Client</h2>
              <p className="text-xs text-slate-500">Volume horaire consommé par portefeuille client</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="space-y-3">
            {clientHoursMap.map(item => {
              const pct = totalLoggedHours > 0 ? Math.round((item.hours / totalLoggedHours) * 100) : 0;

              return (
                <div key={item.client.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.client.colorTag || '#3b82f6' }} />
                      {item.client.name}
                    </span>
                    <span className="font-mono text-slate-600">
                      <b>{item.hours} h</b> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: item.client.colorTag || '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Suivi Synthétique des Budgets Missions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Consommation des Missions</h2>
              <p className="text-xs text-slate-500">État d'avancement des enveloppes d'heures</p>
            </div>
            <button
              onClick={() => setActiveTab('budget-tracking')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Consulter Suivi Budgétaire <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {missionBudgetSummaries.slice(0, 4).map(s => (
              <div key={s.mission.id} className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{s.client.name}</span>
                    <h4 className="text-xs font-bold text-slate-900">{s.mission.name}</h4>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                <ProgressBar percentage={s.consumptionPercentage} size="sm" />

                <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                  <span>Réalisé: <b>{s.realizedHours}h</b> / {s.budgetHours}h</span>
                  <span>Consommation: <b>{s.consumptionPercentage}%</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
