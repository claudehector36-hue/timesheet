import React, { useState } from 'react';
import { User, TimeEntry, TaskStatus } from '../types';
import { Clock, CheckCircle, Save, FileText, Calendar, Building, Briefcase, Activity, CheckSquare } from 'lucide-react';

interface TimeEntryViewProps {
  currentUser: User;
  initialData?: {
    clientName?: string;
    missionName?: string;
    activity?: string;
    description?: string;
  };
  onSaveTimeEntry: (entry: Partial<TimeEntry>) => void;
  onNavigate: (tab: string) => void;
}

export const TimeEntryView: React.FC<TimeEntryViewProps> = ({
  currentUser,
  initialData,
  onSaveTimeEntry,
  onNavigate
}) => {
  // Form State with FREE TEXT INPUTS and Status Select
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [missionName, setMissionName] = useState(initialData?.missionName || '');
  const [activity, setActivity] = useState(initialData?.activity || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [hours, setHours] = useState<number>(7);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('En cours');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSaveTimeEntry({
      userId: currentUser.id,
      userName: `${currentUser.firstName} ${currentUser.lastName}`,
      clientId: '',
      clientName: clientName.trim() || 'Client Général',
      missionId: '',
      missionName: missionName.trim() || 'Mission Tâche',
      activity: activity.trim() || 'Tâche Effectuée',
      date,
      hours: Number(hours),
      description: description.trim(),
      taskStatus,
      status: 'APPROVED'
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);

    // Reset inputs
    setDescription('');
    setActivity('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Saisie de Tâche & Temps
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Renseignez manuellement les informations relatives aux tâches que vous avez effectuées.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 shrink-0">
          Utilisateur : <span className="text-indigo-600 font-bold">{currentUser.firstName} {currentUser.lastName}</span>
        </div>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3 text-emerald-800 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold">
            Votre tâche a été directement enregistrée dans votre Timesheet !
          </p>
        </div>
      )}

      {/* Free Text Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* Row 1: Date, Duration & Task Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Date de Réalisation
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Durée (Heures)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0.25"
                  max="24"
                  step="0.25"
                  required
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-base font-bold text-slate-900 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
                <div className="flex space-x-1 shrink-0">
                  {[3.5, 7, 8].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setHours(preset)}
                      className={`px-2 py-2 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                        hours === preset ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                État d'avancement
              </label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-50/50 cursor-pointer"
              >
                <option value="En attente">🟠 En attente</option>
                <option value="En cours">🔵 En cours</option>
                <option value="Terminé">🟢 Terminé</option>
              </select>
            </div>
          </div>

          {/* Row 2: Client & Mission / Projet (FREE TEXT) */}
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
                placeholder="Écrivez le nom de la mission ou projet..."
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 3: Activité (FREE TEXT) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              Intitulé de l'Activité / Tâche
            </label>
            <input
              type="text"
              required
              placeholder="Saisissez l'intitulé de l'activité (ex: Conception, Rédaction, Réunion, Développement...)"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Row 4: Description / Détail (FREE TEXT) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              Description & Détails de la Tâche
            </label>
            <textarea
              rows={4}
              required
              placeholder="Renseignez la description détaillée du travail effectué..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 text-slate-800 leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('time-history')}
              className="text-slate-600 font-semibold hover:text-indigo-600 transition-colors cursor-pointer"
            >
              &larr; Consulter mon historique
            </button>

            <button
              type="submit"
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer dans mon Timesheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
