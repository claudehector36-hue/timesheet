import React, { useState } from 'react';
import { User, TimeEntry, TaskStatus } from '../types';
import { 
  FileSpreadsheet, 
  Search, 
  Clock, 
  Calendar, 
  Download, 
  ArrowLeft,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface GlobalTimesheetViewProps {
  users: User[];
  timeEntries: TimeEntry[];
  sessionToken: string;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

type PeriodMode = 'DAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

export const GlobalTimesheetView: React.FC<GlobalTimesheetViewProps> = ({
  users,
  timeEntries,
  sessionToken,
  showToast
}) => {
  // Selected user for detailed timesheet view
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Users List Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Date Filters
  const [periodMode, setPeriodMode] = useState<PeriodMode>('MONTH');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  const [refDate, setRefDate] = useState<Date>(new Date());

  const todayStr = new Date().toISOString().split('T')[0];
  const firstOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [customStartDate, setCustomStartDate] = useState(firstOfMonthStr);
  const [customEndDate, setCustomEndDate] = useState(todayStr);

  const [isExporting, setIsExporting] = useState(false);

  // Helper for rendering status badges
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

  // Date range logic
  const getComputedDateRange = () => {
    if (periodMode === 'DAY') {
      const dateStr = refDate.toISOString().split('T')[0];
      return { startDate: dateStr, endDate: dateStr };
    }

    if (periodMode === 'WEEK') {
      const day = refDate.getDay();
      const diffToMon = refDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(refDate.getFullYear(), refDate.getMonth(), diffToMon);
      const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

      const startStr = monday.toISOString().split('T')[0];
      const endStr = sunday.toISOString().split('T')[0];
      return { startDate: startStr, endDate: endStr, monday, sunday };
    }

    if (periodMode === 'MONTH') {
      const firstDay = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
      const lastDay = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);

      const startStr = firstDay.toISOString().split('T')[0];
      const endStr = lastDay.toISOString().split('T')[0];
      return { startDate: startStr, endDate: endStr };
    }

    return { startDate: customStartDate, endDate: customEndDate };
  };

  const { startDate: computedStartDate, endDate: computedEndDate, monday, sunday } = getComputedDateRange();

  const handlePrevPeriod = () => {
    if (periodMode === 'DAY') {
      const next = new Date(refDate);
      next.setDate(next.getDate() - 1);
      setRefDate(next);
    } else if (periodMode === 'WEEK') {
      const next = new Date(refDate);
      next.setDate(next.getDate() - 7);
      setRefDate(next);
    } else if (periodMode === 'MONTH') {
      const next = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
      setRefDate(next);
    }
  };

  const handleNextPeriod = () => {
    if (periodMode === 'DAY') {
      const next = new Date(refDate);
      next.setDate(next.getDate() + 1);
      setRefDate(next);
    } else if (periodMode === 'WEEK') {
      const next = new Date(refDate);
      next.setDate(next.getDate() + 7);
      setRefDate(next);
    } else if (periodMode === 'MONTH') {
      const next = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 1);
      setRefDate(next);
    }
  };

  const getPeriodLabel = () => {
    if (periodMode === 'DAY') {
      return refDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    if (periodMode === 'WEEK' && monday && sunday) {
      const monStr = monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const sunStr = sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${monStr} → ${sunStr}`;
    }
    if (periodMode === 'MONTH') {
      const str = refDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return `Du ${customStartDate} au ${customEndDate}`;
  };

  const departments = Array.from(new Set(users.map(u => u.department || 'Général')));

  const userSummaries = users.map(u => {
    const userEntries = timeEntries.filter(te => te.userId === u.id);
    const totalHours = userEntries.reduce((sum, te) => sum + te.hours, 0);

    let lastActivity = 'Aucune';
    if (userEntries.length > 0) {
      const dates = userEntries.map(e => e.date).sort();
      lastActivity = dates[dates.length - 1];
    }

    return {
      user: u,
      totalHours,
      entryCount: userEntries.length,
      lastActivity
    };
  });

  const filteredUserSummaries = userSummaries.filter(item => {
    const fullText = `${item.user.firstName} ${item.user.lastName} ${item.user.email}`.toLowerCase();
    const matchesSearch = fullText.includes(searchTerm.toLowerCase().trim());
    const matchesDept = deptFilter === 'ALL' || item.user.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const currentUserEntries = selectedUser
    ? timeEntries.filter(te => {
        if (te.userId !== selectedUser.id) return false;
        if (te.date < computedStartDate || te.date > computedEndDate) return false;
        const taskStatusVal = te.taskStatus || 'Terminé';
        if (statusFilter !== 'Tous' && taskStatusVal !== statusFilter) return false;
        return true;
      })
    : [];

  const periodTotalHours = currentUserEntries.reduce((sum, te) => sum + te.hours, 0);

  const handleDownloadExcel = async () => {
    if (!selectedUser) return;
    setIsExporting(true);

    try {
      let url = `/api/export/excel?userId=${encodeURIComponent(selectedUser.id)}`;
      if (computedStartDate) url += `&startDate=${encodeURIComponent(computedStartDate)}`;
      if (computedEndDate) url += `&endDate=${encodeURIComponent(computedEndDate)}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la génération de l\'export Excel');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const sanitizeName = `${selectedUser.lastName}_${selectedUser.firstName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      a.download = `Timesheet_${sanitizeName}_${computedStartDate}_${computedEndDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      showToast('success', 'Export Excel Téléchargé', `Le Timesheet de ${selectedUser.firstName} ${selectedUser.lastName} a été téléchargé avec succès.`);
    } catch (err) {
      console.error('Error downloading Excel:', err);
      showToast('error', 'Erreur d\'exportation', 'Impossible de télécharger le fichier Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  // 1. LIST OF USERS VIEW
  if (!selectedUser) {
    return (
      <div className="space-y-6">
        {/* Module Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Espace Administrateur</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Timesheet Global</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultez les Timesheets de tous les utilisateurs et téléchargez le modèle Excel officiel.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
              <p className="text-[10px] text-slate-500 uppercase">Utilisateurs</p>
              <p className="font-bold text-slate-900 text-sm font-mono">{users.length}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
              <p className="text-[10px] text-slate-500 uppercase">Heures Cumulées</p>
              <p className="font-bold text-indigo-700 text-sm font-mono">
                {timeEntries.reduce((sum, te) => sum + te.hours, 0)} h
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par Nom, Prénom, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">Tous les départements</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Utilisateur</th>
                <th className="py-3.5 px-4">Département</th>
                <th className="py-3.5 px-4 text-center">Tâches Saisies</th>
                <th className="py-3.5 px-4 text-right">Heures Saisies</th>
                <th className="py-3.5 px-4 text-center">Dernière Saisie</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUserSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUserSummaries.map(({ user, totalHours, entryCount, lastActivity }) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100 shrink-0">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                          <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {user.department || 'Général'}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {entryCount}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-600 text-sm">
                      {totalHours} h
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                      {lastActivity !== 'Aucune' ? lastActivity : <span className="text-slate-300">—</span>}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Consulter Timesheet</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. DETAILED TIMESHEET VIEW FOR SELECTED USER
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedUser(null)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>‹ Retour à la liste des utilisateurs</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white font-bold text-lg flex items-center justify-center border border-indigo-500 shadow-sm shrink-0">
              {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Timesheet de {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedUser.email} • {selectedUser.department}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadExcel}
            disabled={isExporting}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Génération...' : 'Télécharger le Timesheet Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Period Toggle & Status Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['DAY', 'WEEK', 'MONTH', 'CUSTOM'] as PeriodMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setPeriodMode(mode)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  periodMode === mode ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'DAY' ? 'JOUR' : mode === 'WEEK' ? 'SEMAINE' : mode === 'MONTH' ? 'MOIS' : 'PERSONNALISÉ'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En attente">🟠 En attente</option>
              <option value="En cours">🔵 En cours</option>
              <option value="Terminé">🟢 Terminé</option>
            </select>
          </div>
        </div>

        {periodMode !== 'CUSTOM' ? (
          <div className="flex items-center space-x-2">
            <button onClick={handlePrevPeriod} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs font-mono">
              {getPeriodLabel()}
            </div>
            <button onClick={handleNextPeriod} className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs">
            <span>Du:</span>
            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="border rounded px-2 py-1" />
            <span>Au:</span>
            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>
        )}
      </div>

      {/* Timesheet Details Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">Détails des Tâches Réalisées</h3>
          <span className="font-mono text-xs font-bold text-indigo-600">Total : {periodTotalHours} h</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Mission / Projet</th>
              <th className="py-3 px-4">Activité / Intitulé</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-center">Statut</th>
              <th className="py-3 px-4 text-right">Durée</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentUserEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Aucune tâche enregistrée pour cette période et ce statut.
                </td>
              </tr>
            ) : (
              currentUserEntries.map((te) => (
                <tr key={te.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{te.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{te.clientName}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{te.missionName}</td>
                  <td className="py-3 px-4 text-slate-700">{te.activity}</td>
                  <td className="py-3 px-4 text-slate-600">{te.description || '-'}</td>
                  <td className="py-3 px-4 text-center">{renderStatusBadge(te.taskStatus)}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">{te.hours} h</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
            <tr>
              <td colSpan={6} className="py-3 px-4 text-right uppercase text-[10px] text-slate-500">Total Heures :</td>
              <td className="py-3 px-4 text-right font-mono text-indigo-600 text-sm">{periodTotalHours} h</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
