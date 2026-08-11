import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { MissionBudgetSummary } from '../../types';
import { 
  PieChart, 
  Search, 
  Filter, 
  Building2, 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  ChevronRight,
  User
} from 'lucide-react';

export const BudgetTrackingPage: React.FC = () => {
  const { missionBudgetSummaries, clients, timeEntries, users } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TOUS');

  // Modal for detail breakdown
  const [selectedSummary, setSelectedSummary] = useState<MissionBudgetSummary | null>(null);

  // Filter summaries
  const filteredSummaries = missionBudgetSummaries.filter(item => {
    if (selectedClientId && item.client.id !== selectedClientId) return false;
    if (selectedStatus !== 'TOUS' && item.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matches = 
        item.mission.name.toLowerCase().includes(term) ||
        item.mission.code.toLowerCase().includes(term) ||
        item.client.name.toLowerCase().includes(term);
      if (!matches) return false;
    }

    return true;
  });

  // Aggregated totals
  const totalBudgetHours = filteredSummaries.reduce((sum, s) => sum + s.budgetHours, 0);
  const totalRealizedHours = filteredSummaries.reduce((sum, s) => sum + s.realizedHours, 0);
  const totalRemainingHours = filteredSummaries.reduce((sum, s) => sum + s.remainingHours, 0);

  // Time entries for selected detail mission
  const detailEntries = selectedSummary 
    ? timeEntries.filter(te => te.missionId === selectedSummary.mission.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <PieChart className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Suivi Budgétaire des Missions</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Contrôle en temps réel des enveloppes d'heures mensuelles, de la consommation et des alertes de dépassement.
          </p>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget Global Alloué</p>
          <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{totalBudgetHours} h</p>
          <p className="text-[11px] text-slate-500 mt-1">Total mensuel des contrats</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Heures Consommées (Réalisé)</p>
          <p className="text-xl font-extrabold text-indigo-700 font-mono mt-0.5">{totalRealizedHours} h</p>
          <p className="text-[11px] text-slate-500 mt-1">Saisies approuvées & soumises</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Heures Restantes</p>
          <p className="text-xl font-extrabold text-teal-700 font-mono mt-0.5">{totalRemainingHours} h</p>
          <p className="text-[11px] text-slate-500 mt-1">Disponible sur la période</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une mission, code, client..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        {/* Client Filter */}
        <div>
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="">Tous les Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="TOUS">Tous les Statuts Budgétaires</option>
            <option value="OK">OK (&lt; 80%)</option>
            <option value="Alerte">Alerte (≥ 80%)</option>
            <option value="Dépassement">Dépassement (&gt; 100%)</option>
          </select>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Mission & Code</th>
                <th className="py-3.5 px-4 text-center">Budget (h)</th>
                <th className="py-3.5 px-4 text-center">Réalisé (h)</th>
                <th className="py-3.5 px-4 text-center">Reste (h)</th>
                <th className="py-3.5 px-4 min-w-[160px]">Consommation</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    Aucune mission ne correspond aux critères de suivi budgétaire.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map(s => (
                  <tr 
                    key={s.mission.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedSummary(s)}
                  >
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: s.client.colorTag || '#3b82f6' }} 
                        />
                        <span>{s.client.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{s.mission.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.mission.code}</p>
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">
                      {s.budgetHours} h
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-indigo-700">
                      {s.realizedHours} h
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold">
                      <span className={s.remainingHours === 0 ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
                        {s.remainingHours} h
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <ProgressBar percentage={s.consumptionPercentage} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mission Detail Modal */}
      <Modal
        isOpen={!!selectedSummary}
        onClose={() => setSelectedSummary(null)}
        title={`Détail Budgétaire - ${selectedSummary?.mission.name}`}
        maxWidth="xl"
      >
        {selectedSummary && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-indigo-600 uppercase">Client : {selectedSummary.client.name}</p>
                <p className="text-sm font-bold text-slate-900">{selectedSummary.mission.name} ({selectedSummary.mission.code})</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedSummary.mission.description || 'Pas de description'}</p>
              </div>
              <StatusBadge status={selectedSummary.status} />
            </div>

            {/* Progress bar */}
            <ProgressBar percentage={selectedSummary.consumptionPercentage} size="lg" />

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-100 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Budget Mensuel</p>
                <p className="text-base font-bold text-slate-900 font-mono mt-0.5">{selectedSummary.budgetHours} h</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-900 rounded-xl">
                <p className="text-[10px] text-indigo-600 uppercase font-bold">Réalisé</p>
                <p className="text-base font-bold font-mono mt-0.5">{selectedSummary.realizedHours} h</p>
              </div>
              <div className="p-3 bg-teal-50 text-teal-900 rounded-xl">
                <p className="text-[10px] text-teal-600 uppercase font-bold">Reste</p>
                <p className="text-base font-bold font-mono mt-0.5">{selectedSummary.remainingHours} h</p>
              </div>
            </div>

            {/* Time entries list on this mission */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Historique des Saisies Rattachées</h4>
              {detailEntries.length === 0 ? (
                <p className="text-slate-500 italic">Aucune saisie de temps enregistrée sur cette mission.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {detailEntries.map(e => {
                    const u = users.find(user => user.id === e.userId);
                    return (
                      <div key={e.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{u?.name} • <span className="text-slate-500 font-normal">{e.date}</span></p>
                          <p className="text-slate-500 text-[11px]">{e.taskType} - {e.description}</p>
                        </div>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {e.hours} h
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
