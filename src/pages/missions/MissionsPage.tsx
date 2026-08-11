import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Mission } from '../../types';
import { 
  Briefcase, 
  PlusCircle, 
  Search, 
  Building2, 
  Calendar, 
  Users, 
  Clock, 
  Edit3,
  CheckCircle2
} from 'lucide-react';

export const MissionsPage: React.FC = () => {
  const { missions, clients, users, timeEntries, addMission, updateMission } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missionToEdit, setMissionToEdit] = useState<Mission | null>(null);

  // Form states
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [monthlyBudgetHours, setMonthlyBudgetHours] = useState<number>(50);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'En cours' | 'Terminée' | 'En pause'>('En cours');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const filteredMissions = missions.filter(m => {
    if (selectedClientId && m.clientId !== selectedClientId) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const client = clients.find(c => c.id === m.clientId);
      return m.name.toLowerCase().includes(term) ||
             m.code.toLowerCase().includes(term) ||
             (client && client.name.toLowerCase().includes(term));
    }
    return true;
  });

  const handleOpenModal = (mission?: Mission) => {
    if (mission) {
      setMissionToEdit(mission);
      setClientId(mission.clientId);
      setName(mission.name);
      setCode(mission.code);
      setMonthlyBudgetHours(mission.monthlyBudgetHours);
      setStartDate(mission.startDate);
      setEndDate(mission.endDate || '');
      setStatus(mission.status);
      setAssignedUserIds(mission.assignedUserIds);
      setDescription(mission.description || '');
    } else {
      setMissionToEdit(null);
      const activeClients = clients.filter(c => c.status === 'Actif');
      setClientId(activeClients[0]?.id || clients[0]?.id || '');
      setName('');
      setCode('');
      setMonthlyBudgetHours(50);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setStatus('En cours');
      setAssignedUserIds([]);
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleToggleUser = (userId: string) => {
    if (assignedUserIds.includes(userId)) {
      setAssignedUserIds(prev => prev.filter(id => id !== userId));
    } else {
      setAssignedUserIds(prev => [...prev, userId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !name.trim() || !code.trim()) return;

    if (missionToEdit) {
      updateMission({
        ...missionToEdit,
        clientId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        monthlyBudgetHours: Number(monthlyBudgetHours),
        startDate,
        endDate: endDate || undefined,
        status,
        assignedUserIds,
        description: description.trim(),
      });
    } else {
      addMission({
        clientId,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        monthlyBudgetHours: Number(monthlyBudgetHours),
        startDate,
        endDate: endDate || undefined,
        status,
        assignedUserIds,
        description: description.trim(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Gestion des Missions</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Définissez les objectifs, budgets d'heures mensuels et affectez les collaborateurs par projet.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvelle Mission
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une mission, code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

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
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMissions.map(m => {
          const client = clients.find(c => c.id === m.clientId);
          const consumedHours = timeEntries
            .filter(te => te.missionId === m.id)
            .reduce((sum, te) => sum + te.hours, 0);
          const pct = Math.round((consumedHours / (m.monthlyBudgetHours || 1)) * 100);

          return (
            <div 
              key={m.id} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    {client?.name}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{m.name}</h3>
                  <p className="text-[11px] font-mono font-semibold text-slate-400 mt-0.5">{m.code}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>

              {m.description && (
                <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {m.description}
                </p>
              )}

              {/* Progress bar */}
              <div className="space-y-1">
                <ProgressBar percentage={pct} size="sm" />
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                  <span>Réalisé: <b>{consumedHours}h</b> / {m.monthlyBudgetHours}h</span>
                  <span>Reste: <b>{Math.max(0, m.monthlyBudgetHours - consumedHours)}h</b></span>
                </div>
              </div>

              {/* Assigned collaborators avatars */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Équipe :</span>
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {m.assignedUserIds.map(uid => {
                      const u = users.find(user => user.id === uid);
                      if (!u) return null;
                      return u.avatarUrl ? (
                        <img 
                          key={u.id} 
                          src={u.avatarUrl} 
                          alt={u.name} 
                          title={u.name}
                          className="w-6 h-6 rounded-full object-cover ring-2 ring-white" 
                        />
                      ) : (
                        <div 
                          key={u.id} 
                          title={u.name}
                          className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-bold ring-2 ring-white"
                        >
                          {u.name.charAt(0)}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal(m)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Modifier la mission"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={missionToEdit ? 'Modifier la Mission' : 'Créer une nouvelle Mission'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Rattaché</label>
              <select
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              >
                {clients.filter(c => c.status === 'Actif').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom de la Mission</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Refonte SI Achats"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Code Mission</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex: ACME-SI-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Budget Mensuel (heures)</label>
              <input
                type="number"
                min="1"
                value={monthlyBudgetHours}
                onChange={e => setMonthlyBudgetHours(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date Début</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date Fin (optionnelle)</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Statut</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="En cours">En cours</option>
                <option value="En pause">En pause</option>
                <option value="Terminée">Terminée</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Objectifs</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Cadrage, accompagnement agile et delivery..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Assign Collaborators checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Collaborateurs Affectés</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              {users.map(u => {
                const isAssigned = assignedUserIds.includes(u.id);
                return (
                  <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => handleToggleUser(u.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-slate-800">{u.name}</span>
                    <span className="text-[10px] text-slate-400">({u.team})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
