import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { TaskType, TimeEntry, TimeEntryStatus } from '../../types';
import { Calendar, Clock, Briefcase, Building2, Tag, FileText } from 'lucide-react';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: TimeEntry | null;
}

const TASK_TYPES: TaskType[] = [
  'Conseil & Stratégie',
  'Développement & Tech',
  'Design & UX/UI',
  'Gestion de projet',
  'Réunion & Cadrage',
  'Recette & QA',
  'Support & Maintenance',
  'Formation & Documentation',
];

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  isOpen,
  onClose,
  entryToEdit,
}) => {
  const { currentUser, clients, missions, addTimeEntry, updateTimeEntry } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientId, setClientId] = useState('');
  const [missionId, setMissionId] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Développement & Tech');
  const [hours, setHours] = useState<number>(7.5);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TimeEntryStatus>('Soumis');
  const [error, setError] = useState('');

  // Available missions for selected client and filtered for current user if Collaborateur
  const filteredMissions = missions.filter(m => {
    const matchesClient = clientId ? m.clientId === clientId : true;
    if (currentUser.role === 'COLLABORATEUR') {
      return matchesClient && m.assignedUserIds.includes(currentUser.id);
    }
    return matchesClient;
  });

  useEffect(() => {
    if (entryToEdit) {
      setDate(entryToEdit.date);
      setClientId(entryToEdit.clientId);
      setMissionId(entryToEdit.missionId);
      setTaskType(entryToEdit.taskType);
      setHours(entryToEdit.hours);
      setDescription(entryToEdit.description);
      setStatus(entryToEdit.status);
    } else {
      // Defaults
      setDate(new Date().toISOString().split('T')[0]);
      const activeClients = clients.filter(c => c.status === 'Actif');
      const firstClient = activeClients[0]?.id || '';
      setClientId(firstClient);
      
      const availableMissions = missions.filter(m => m.clientId === firstClient);
      setMissionId(availableMissions[0]?.id || missions[0]?.id || '');
      setTaskType('Développement & Tech');
      setHours(7.5);
      setDescription('');
      setStatus('Soumis');
    }
    setError('');
  }, [entryToEdit, isOpen, clients, missions]);

  // When client changes, select first mission of that client
  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    const available = missions.filter(m => m.clientId === newClientId);
    if (available.length > 0) {
      setMissionId(available[0].id);
    } else {
      setMissionId('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('Veuillez sélectionner une date.');
      return;
    }
    if (!clientId) {
      setError('Veuillez choisir un client.');
      return;
    }
    if (!missionId) {
      setError('Veuillez choisir une mission.');
      return;
    }
    if (!hours || hours <= 0 || hours > 24) {
      setError('Le nombre d\'heures doit être compris entre 0.5 et 24.');
      return;
    }
    if (!description.trim()) {
      setError('Veuillez saisir une description de votre tâche.');
      return;
    }

    if (entryToEdit) {
      updateTimeEntry({
        ...entryToEdit,
        date,
        clientId,
        missionId,
        taskType,
        hours: Number(hours),
        description: description.trim(),
        status,
      });
    } else {
      addTimeEntry({
        userId: currentUser.id,
        clientId,
        missionId,
        date,
        taskType,
        hours: Number(hours),
        description: description.trim(),
        status,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entryToEdit ? 'Modifier la Saisie de Temps' : 'Nouvelle Saisie de Temps'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              required
            />
          </div>

          {/* Hours */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Nombre d'heures
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hours}
                onChange={e => setHours(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                required
              />
              <span className="text-xs font-bold text-slate-500">heures</span>
            </div>
            {/* Quick selector buttons */}
            <div className="flex gap-1.5 mt-1.5">
              {[3.5, 4, 7.5, 8].map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHours(h)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${hours === h ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Client & Mission */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Client
            </label>
            <select
              value={clientId}
              onChange={e => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              required
            >
              {clients.filter(c => c.status === 'Actif').map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Mission
            </label>
            <select
              value={missionId}
              onChange={e => setMissionId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              required
            >
              {filteredMissions.length === 0 ? (
                <option value="">Aucune mission associée pour ce client</option>
              ) : (
                filteredMissions.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Task Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Type de tâche
          </label>
          <select
            value={taskType}
            onChange={e => setTaskType(e.target.value as TaskType)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
          >
            {TASK_TYPES.map(tt => (
              <option key={tt} value={tt}>{tt}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Description des travaux réalisés
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Rédaction des spécifications fonctionnelles du module de commande..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 resize-none"
            required
          />
        </div>

        {/* Status selection (Draft vs Submit) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="entryStatus"
                checked={status === 'Soumis'}
                onChange={() => setStatus('Soumis')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              Soumettre pour validation
            </label>
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="entryStatus"
                checked={status === 'Brouillon'}
                onChange={() => setStatus('Brouillon')}
                className="text-slate-600 focus:ring-slate-500"
              />
              Enregistrer en Brouillon
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all"
            >
              {entryToEdit ? 'Enregistrer les modifications' : 'Valider la Saisie'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
