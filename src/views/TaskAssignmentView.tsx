import React, { useState } from 'react';
import { User, AssignedTask } from '../types';
import { CheckSquare, UserPlus, Calendar, Clock, Building, Briefcase, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface TaskAssignmentViewProps {
  users: User[];
  assignedTasks: AssignedTask[];
  currentUser: User;
  onAssignTask: (task: Partial<AssignedTask>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskAssignmentView: React.FC<TaskAssignmentViewProps> = ({
  users,
  assignedTasks,
  currentUser,
  onAssignTask,
  onDeleteTask
}) => {
  const [targetUserId, setTargetUserId] = useState(users[0]?.id || '');
  const [clientName, setClientName] = useState('');
  const [missionName, setMissionName] = useState('');
  const [activity, setActivity] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(7);
  const [isSuccess, setIsSuccess] = useState(false);

  const activeUsers = users.filter(u => u.status === 'ACTIVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;

    onAssignTask({
      assignedToUserId: targetUserId,
      clientName: clientName.trim() || 'Client Général',
      missionName: missionName.trim() || 'Projet Général',
      activity: activity.trim() || 'Tâche Attribuée',
      description: description.trim(),
      dueDate,
      estimatedHours: Number(estimatedHours)
    });

    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);

    // Reset fields
    setClientName('');
    setMissionName('');
    setActivity('');
    setDescription('');
    setDueDate('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            Attribuer une Tâche
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Permet à l'administrateur d'assigner une tâche spécifique à un utilisateur.
          </p>
        </div>
      </div>

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 text-emerald-800 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold">
            Tâche attribuée avec succès ! L'utilisateur la verra dans son espace personnel.
          </p>
        </div>
      )}

      {/* Assignment Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* User selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-slate-500" />
              Sélectionner l'Utilisateur Destinataire
            </label>
            <select
              required
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-50/50 cursor-pointer text-xs"
            >
              {activeUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email}) - {u.department}
                </option>
              ))}
            </select>
          </div>

          {/* Client & Mission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Nom du Client
              </label>
              <input
                type="text"
                required
                placeholder="Écrivez le nom du client..."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                Nom de la Mission / Projet
              </label>
              <input
                type="text"
                required
                placeholder="Écrivez le nom de la mission..."
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Intitulé & Hours & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 mb-1.5">Intitulé de la Tâche</label>
              <input
                type="text"
                required
                placeholder="ex: Rédaction rapport, Audit..."
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Estimation Heures</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Échéance Souhaitée</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Consignes & Détails de la Tâche</label>
            <textarea
              rows={3}
              required
              placeholder="Expliquez à l'utilisateur le travail à réaliser..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Attribuer cette tâche</span>
            </button>
          </div>
        </form>
      </div>

      {/* List of Assigned Tasks */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Tâches Attribuées en Cours</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Client / Projet</th>
                <th className="py-3 px-4">Intitulé</th>
                <th className="py-3 px-4">Consignes</th>
                <th className="py-3 px-4">Échéance</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Aucune tâche actuellement attribuée.
                  </td>
                </tr>
              ) : (
                assignedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{task.assignedToUserName}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{task.clientName}</p>
                      <p className="text-[10px] text-slate-500">{task.missionName}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{task.activity}</td>
                    <td className="py-3 px-4 text-slate-600 italic">"{task.description}"</td>
                    <td className="py-3 px-4 font-mono">{task.dueDate || 'S.O.'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {task.status === 'COMPLETED' ? 'Terminée' : task.status === 'IN_PROGRESS' ? 'En Cours' : 'En Attente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Annuler / Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
