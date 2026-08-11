import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../../components/common/Badge';
import { 
  UserCheck, 
  Search, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Award,
  ArrowUpDown
} from 'lucide-react';

export const CollaborateursSynthesisPage: React.FC = () => {
  const { collaboratorSummaries } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [sortBy, setSortBy] = useState<'hours' | 'validation' | 'name'>('hours');

  // Teams list
  const teams = Array.from(new Set(collaboratorSummaries.map(s => s.user.team)));

  // Filter & sort
  const filteredSummaries = collaboratorSummaries
    .filter(s => {
      if (selectedTeam && s.user.team !== selectedTeam) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matches = 
          s.user.name.toLowerCase().includes(term) ||
          s.user.email.toLowerCase().includes(term) ||
          s.user.title.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'hours') return b.totalLoggedHours - a.totalLoggedHours;
      if (sortBy === 'validation') return b.validationRate - a.validationRate;
      return a.user.name.localeCompare(b.user.name);
    });

  const totalTeamLogged = filteredSummaries.reduce((sum, s) => sum + s.totalLoggedHours, 0);
  const totalTeamValidated = filteredSummaries.reduce((sum, s) => sum + s.validatedHours, 0);
  const averageValidationRate = filteredSummaries.length > 0
    ? Math.round(filteredSummaries.reduce((sum, s) => sum + s.validationRate, 0) / filteredSummaries.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Synthèse des Collaborateurs</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyse de l'activité, de la productivité et des taux de validation des membres de l'équipe.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Collaborateurs Analysés</p>
          <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{filteredSummaries.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Membres d'équipe actifs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Cumul Heures Déclarées</p>
          <p className="text-xl font-extrabold text-indigo-700 font-mono mt-0.5">{totalTeamLogged} h</p>
          <p className="text-[11px] text-slate-500 mt-1">dont {totalTeamValidated}h validées</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Taux de Validation Moyen</p>
          <p className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">{averageValidationRate} %</p>
          <p className="text-[11px] text-slate-500 mt-1">Qualité des saisies</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un collaborateur..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        {/* Team Filter */}
        <div>
          <select
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="">Toutes les Équipes</option>
            {teams.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Sort option */}
        <div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="hours">Trier par Total Heures</option>
            <option value="validation">Trier par Taux de Validation</option>
            <option value="name">Trier par Nom</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Collaborateur</th>
                <th className="py-3.5 px-4">Équipe & Postes</th>
                <th className="py-3.5 px-4 text-center">Missions</th>
                <th className="py-3.5 px-4 text-center">Heures Saisies</th>
                <th className="py-3.5 px-4 text-center">Validées</th>
                <th className="py-3.5 px-4 text-center">En attente</th>
                <th className="py-3.5 px-4 text-center">Refusées</th>
                <th className="py-3.5 px-4 text-right">Taux de Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.map(s => (
                <tr key={s.user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      {s.user.avatarUrl ? (
                        <img src={s.user.avatarUrl} alt={s.user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {s.user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{s.user.name}</p>
                        <p className="text-[10px] text-slate-500">{s.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{s.user.team}</p>
                    <p className="text-[10px] text-slate-500">{s.user.title}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {s.assignedMissionsCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                    {s.totalLoggedHours} h
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                    {s.validatedHours} h
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-600">
                    {s.pendingHours} h
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-600">
                    {s.rejectedHours} h
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-indigo-600">
                    <span className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                      {s.validationRate} %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
