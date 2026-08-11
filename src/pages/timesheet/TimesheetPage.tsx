import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeEntryModal } from '../../components/timesheet/TimeEntryModal';
import { StatusBadge } from '../../components/common/Badge';
import { TimeEntry, TimeEntryStatus } from '../../types';
import { 
  Clock, 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  Briefcase, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';

export const TimesheetPage: React.FC = () => {
  const { 
    currentUser, 
    timeEntries, 
    clients, 
    missions, 
    deleteTimeEntry 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<TimeEntry | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TOUS');

  // Filter entries
  const filteredEntries = timeEntries.filter(entry => {
    // If collaborateur, show only their entries unless manager/admin viewing
    if (currentUser.role === 'COLLABORATEUR' && entry.userId !== currentUser.id) {
      return false;
    }

    if (selectedClientId && entry.clientId !== selectedClientId) return false;
    if (selectedMissionId && entry.missionId !== selectedMissionId) return false;
    if (selectedStatus !== 'TOUS' && entry.status !== selectedStatus) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const client = clients.find(c => c.id === entry.clientId);
      const mission = missions.find(m => m.id === entry.missionId);
      const matchesText = 
        entry.description.toLowerCase().includes(term) ||
        entry.taskType.toLowerCase().includes(term) ||
        (client && client.name.toLowerCase().includes(term)) ||
        (mission && mission.name.toLowerCase().includes(term));
      if (!matchesText) return false;
    }

    return true;
  });

  const totalFilteredHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
  const validatedFilteredHours = filteredEntries.filter(e => e.status === 'Validé').reduce((sum, e) => sum + e.hours, 0);
  const pendingFilteredHours = filteredEntries.filter(e => e.status === 'Soumis').reduce((sum, e) => sum + e.hours, 0);

  const handleEdit = (entry: TimeEntry) => {
    setEntryToEdit(entry);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette saisie de temps ?')) {
      deleteTimeEntry(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Saisie et Suivi des Temps</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Déclarez vos heures de travail, consultez l'historique et le statut de vos imputations.
          </p>
        </div>

        <button
          onClick={() => {
            setEntryToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Saisir du temps
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total sélectionné</p>
            <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{totalFilteredHours} h</p>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Heures Validées</p>
            <p className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">{validatedFilteredHours} h</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">En attente</p>
            <p className="text-xl font-extrabold text-amber-700 font-mono mt-0.5">{pendingFilteredHours} h</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Recherche dans la description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          {/* Client Filter */}
          <div>
            <select
              value={selectedClientId}
              onChange={e => {
                setSelectedClientId(e.target.value);
                setSelectedMissionId('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="">Tous les Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Mission Filter */}
          <div>
            <select
              value={selectedMissionId}
              onChange={e => setSelectedMissionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              <option value="">Toutes les Missions</option>
              {missions
                .filter(m => selectedClientId ? m.clientId === selectedClientId : true)
                .map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
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
              <option value="TOUS">Tous les Statuts</option>
              <option value="Soumis">Soumis (En attente)</option>
              <option value="Validé">Validé</option>
              <option value="Refusé">Refusé</option>
              <option value="Brouillon">Brouillon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Aucune saisie de temps ne correspond aux filtres sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Mission</th>
                  <th className="py-3 px-4">Tâche</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Durée</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map(entry => {
                  const client = clients.find(c => c.id === entry.clientId);
                  const mission = missions.find(m => m.id === entry.missionId);
                  const canEdit = entry.status === 'Soumis' || entry.status === 'Brouillon' || entry.status === 'Refusé' || currentUser.role === 'ADMIN';

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {client?.name || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {mission?.name || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {entry.taskType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="line-clamp-2">{entry.description}</p>
                        {entry.status === 'Refusé' && entry.rejectionReason && (
                          <div className="mt-1 p-1.5 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-700 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>Motif du refus: {entry.rejectionReason}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                        {entry.hours} h
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(entry)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Time Entry Modal */}
      <TimeEntryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEntryToEdit(null);
        }}
        entryToEdit={entryToEdit}
      />
    </div>
  );
};
