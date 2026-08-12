import React, { useState } from 'react';
import { TimeEntry, User, TaskStatus } from '../types';
import { Search, Trash2, FileSpreadsheet, Calendar, Clock, Edit2, Filter } from 'lucide-react';

interface TimeHistoryViewProps {
  entries: TimeEntry[];
  currentUser: User;
  onUpdateEntry?: (id: string, data: Partial<TimeEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onExportExcel: () => void;
}

export const TimeHistoryView: React.FC<TimeHistoryViewProps> = ({
  entries,
  currentUser,
  onUpdateEntry,
  onDeleteEntry,
  onExportExcel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodMode, setPeriodMode] = useState<'ALL' | 'DAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('Tous');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimeEntry>>({});

  // Date filtering logic
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredEntries = entries.filter(te => {
    // Search term matching free text fields
    const matchesSearch = `${te.clientName} ${te.missionName} ${te.activity} ${te.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    const currentStatus = te.taskStatus || 'Terminé';
    if (statusFilter !== 'Tous' && currentStatus !== statusFilter) {
      return false;
    }

    if (periodMode === 'DAY') {
      return te.date === todayStr;
    }

    if (periodMode === 'WEEK') {
      const now = new Date();
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().split('T')[0];
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7)).toISOString().split('T')[0];
      return te.date >= firstDay && te.date <= lastDay;
    }

    if (periodMode === 'MONTH') {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      return te.date.startsWith(currentMonth);
    }

    if (periodMode === 'CUSTOM') {
      if (customStart && te.date < customStart) return false;
      if (customEnd && te.date > customEnd) return false;
      return true;
    }

    return true;
  });

  const totalHours = filteredEntries.reduce((sum, te) => sum + te.hours, 0);

  const startEdit = (entry: TimeEntry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry, taskStatus: entry.taskStatus || 'Terminé' });
  };

  const handleSaveEdit = (id: string) => {
    if (onUpdateEntry && editForm) {
      onUpdateEntry(id, editForm);
    }
    setEditingId(null);
  };

  const renderStatusBadge = (statusVal?: TaskStatus) => {
    const val = statusVal || 'Terminé';
    if (val === 'En attente') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          🟠 En attente
        </span>
      );
    }
    if (val === 'En cours') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          🔵 En cours
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        🟢 Terminé
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Mes Tâches & Historique
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consultez et recherchez toutes les tâches que vous avez enregistrées dans votre Timesheet.
          </p>
        </div>

        <button
          onClick={onExportExcel}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Télécharger mon Timesheet Excel (.xlsx)</span>
        </button>
      </div>

      {/* Period & Status Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Period selector tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap items-center gap-1 border border-slate-200 w-full md:w-auto">
            <button
              onClick={() => setPeriodMode('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodMode === 'ALL' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setPeriodMode('DAY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodMode === 'DAY' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setPeriodMode('WEEK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodMode === 'WEEK' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cette Semaine
            </button>
            <button
              onClick={() => setPeriodMode('MONTH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodMode === 'MONTH' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ce Mois
            </button>
            <button
              onClick={() => setPeriodMode('CUSTOM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                periodMode === 'CUSTOM' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personnalisé
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-600 hidden sm:inline">Statut :</span>
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

            {/* Search bar */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher tâche, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Custom date range inputs */}
        {periodMode === 'CUSTOM' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600">Du :</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-600">Au :</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tasks Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Mission / Projet</th>
                <th className="py-3.5 px-4">Activité / Tâche</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Durée</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucune tâche enregistrée pour les critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((te) => {
                  const isEditing = editingId === te.id;

                  if (isEditing) {
                    return (
                      <tr key={te.id} className="bg-indigo-50/50">
                        <td className="py-3 px-4">
                          <input
                            type="date"
                            value={editForm.date || ''}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="border border-slate-300 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={editForm.clientName || ''}
                            onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                            className="border border-slate-300 rounded px-2 py-1 text-xs w-full"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={editForm.missionName || ''}
                            onChange={(e) => setEditForm({ ...editForm, missionName: e.target.value })}
                            className="border border-slate-300 rounded px-2 py-1 text-xs w-full"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={editForm.activity || ''}
                            onChange={(e) => setEditForm({ ...editForm, activity: e.target.value })}
                            className="border border-slate-300 rounded px-2 py-1 text-xs w-full"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <textarea
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="border border-slate-300 rounded px-2 py-1 text-xs w-full"
                            rows={2}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={editForm.taskStatus || 'Terminé'}
                            onChange={(e) => setEditForm({ ...editForm, taskStatus: e.target.value as TaskStatus })}
                            className="border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                          >
                            <option value="En attente">En attente</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <input
                            type="number"
                            step="0.5"
                            value={editForm.hours || 0}
                            onChange={(e) => setEditForm({ ...editForm, hours: Number(e.target.value) })}
                            className="border border-slate-300 rounded px-2 py-1 text-xs w-16 text-right font-bold"
                          />
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleSaveEdit(te.id)}
                            className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded text-[10px] hover:bg-indigo-700 cursor-pointer"
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 bg-slate-200 text-slate-700 font-bold rounded text-[10px] hover:bg-slate-300 cursor-pointer"
                          >
                            Annuler
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={te.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{te.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{te.clientName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{te.missionName}</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{te.activity}</td>
                      <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-xs truncate">
                        {te.description || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderStatusBadge(te.taskStatus)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-indigo-600 text-sm">
                        {te.hours} h
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => startEdit(te)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                          title="Modifier la tâche"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEntry(te.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Supprimer la tâche"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-xs border-t border-slate-200">
              <tr>
                <td colSpan={6} className="py-3.5 px-4 text-right uppercase tracking-wider text-[10px] text-slate-500">
                  Total des Heures ({filteredEntries.length} tâches) :
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-indigo-600 text-sm">
                  {totalHours.toFixed(1)} h
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
