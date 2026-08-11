import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { TimeEntry } from '../../types';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  User, 
  Building2, 
  Briefcase, 
  Calendar, 
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export const ValidationPage: React.FC = () => {
  const { 
    timeEntries, 
    users, 
    clients, 
    missions, 
    validateTimeEntry, 
    rejectTimeEntry, 
    bulkValidateTimeEntries 
  } = useApp();

  const [selectedUserFilter, setSelectedUserFilter] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reject modal state
  const [rejectingEntry, setRejectingEntry] = useState<TimeEntry | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Pending entries
  const pendingEntries = timeEntries.filter(e => e.status === 'Soumis');

  // Filter pending entries
  const filteredEntries = pendingEntries.filter(e => {
    if (selectedUserFilter && e.userId !== selectedUserFilter) return false;
    if (selectedClientFilter && e.clientId !== selectedClientFilter) return false;
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredEntries.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    bulkValidateTimeEntries(selectedIds);
    setSelectedIds([]);
  };

  const handleOpenReject = (entry: TimeEntry) => {
    setRejectingEntry(entry);
    setRejectionReason('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingEntry) return;
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer un motif de refus.');
      return;
    }
    rejectTimeEntry(rejectingEntry.id, rejectionReason.trim());
    setRejectingEntry(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Validation des Temps</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Examinez et validez les déclarations d'heures soumises par les collaborateurs.
          </p>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkApprove}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            Valider la sélection ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Collaborateur Filter */}
        <div>
          <select
            value={selectedUserFilter}
            onChange={e => setSelectedUserFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="">Tous les Collaborateurs</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.team})</option>
            ))}
          </select>
        </div>

        {/* Client Filter */}
        <div>
          <select
            value={selectedClientFilter}
            onChange={e => setSelectedClientFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="">Tous les Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Info stats */}
        <div className="flex items-center justify-end px-3 py-2 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs font-semibold text-amber-800">
          <span>{filteredEntries.length} saisie(s) en attente</span>
        </div>
      </div>

      {/* Main Validation Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            Aucune déclaration d'heures en attente de validation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredEntries.length && filteredEntries.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="py-3 px-4">Collaborateur</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Client & Mission</th>
                  <th className="py-3 px-4">Tâche & Description</th>
                  <th className="py-3 px-4 text-center">Durée</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.map(entry => {
                  const user = users.find(u => u.id === entry.userId);
                  const client = clients.find(c => c.id === entry.clientId);
                  const mission = missions.find(m => m.id === entry.missionId);
                  const isChecked = selectedIds.includes(entry.id);

                  return (
                    <tr key={entry.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-indigo-50/30' : ''}`}>
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(entry.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                              {user?.name.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900">{user?.name || 'Utilisateur'}</p>
                            <p className="text-[10px] text-slate-500">{user?.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{mission?.name}</p>
                        <p className="text-[10px] text-slate-500">{client?.name}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                        <span className="inline-block px-1.5 py-0.5 bg-slate-100 font-semibold text-[10px] text-slate-700 rounded mb-1">
                          {entry.taskType}
                        </span>
                        <p className="text-xs line-clamp-2">{entry.description}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                        {entry.hours} h
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => validateTimeEntry(entry.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Valider
                          </button>
                          <button
                            onClick={() => handleOpenReject(entry)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Refuser
                          </button>
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

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingEntry}
        onClose={() => setRejectingEntry(null)}
        title="Refuser la saisie de temps"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            Veuillez indiquer le motif du refus pour que le collaborateur puisse corriger sa demande.
          </p>

          {rejectingEntry && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p><span className="font-bold">Collaborateur:</span> {users.find(u => u.id === rejectingEntry.userId)?.name}</p>
              <p><span className="font-bold">Date & Heures:</span> {rejectingEntry.date} ({rejectingEntry.hours}h)</p>
              <p><span className="font-bold">Description:</span> {rejectingEntry.description}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Motif de refus / Explication
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Ex: Veuillez préciser la sous-tâche Jira et vérifier le nombre d'heures..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-rose-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectingEntry(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
            >
              Confirmer le Refus
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
