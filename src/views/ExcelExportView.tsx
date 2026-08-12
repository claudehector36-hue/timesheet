import React, { useState } from 'react';
import { User, TimeEntry } from '../types';
import { FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

interface ExcelExportViewProps {
  currentUser: User;
  userEntries: TimeEntry[];
  sessionToken?: string;
}

export const ExcelExportView: React.FC<ExcelExportViewProps> = ({
  currentUser,
  userEntries,
  sessionToken
}) => {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const [periodPreset, setPeriodPreset] = useState<'all' | 'this-month' | 'custom'>('all');
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadExcel = async () => {
    try {
      setIsExporting(true);

      let url = `/api/export/excel?userId=${currentUser.id}`;

      if (periodPreset === 'this-month') {
        url += `&startDate=${firstOfMonth}&endDate=${todayStr}`;
      } else if (periodPreset === 'custom') {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const token = sessionToken || localStorage.getItem('gestia_token');
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Erreur de téléchargement du fichier Excel');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const sanitizeName = `${currentUser.lastName}_${currentUser.firstName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `Timesheet_${sanitizeName}_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Une erreur est survenue lors de la génération du fichier Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Export de Votre Timesheet (.xlsx)</h2>
            <p className="text-xs text-slate-300">Générez votre rapport d'heures Excel selon le modèle officiel.</p>
          </div>
        </div>
      </div>

      {/* Main Configuration Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        
        {/* Preset Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Choisissez la Période à Exporter
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {[
              { id: 'all', label: 'Toutes les Saisies' },
              { id: 'this-month', label: 'Mois en Cours' },
              { id: 'custom', label: 'Période Personnalisée' },
            ].map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPeriodPreset(preset.id as any)}
                className={`p-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  periodPreset === preset.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Picker */}
        {periodPreset === 'custom' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date de Début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date de Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 font-mono"
              />
            </div>
          </div>
        )}

        {/* Content of generated Excel */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Structure du Fichier Excel `.xlsx` Généré
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Onglet 1: Saisie des Temps</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tableau détaillé avec Date, Client, Mission, Activité, Description, Heures et Formule de Total.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Onglet 2: Synthèse Hebdomadaire</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Grille matricielle Lun-Dim par mission avec somme automatisée.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Export pour : <span className="font-bold text-slate-900">{currentUser.firstName} {currentUser.lastName}</span>
          </div>

          <button
            onClick={handleDownloadExcel}
            disabled={isExporting}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Génération en cours...' : 'Télécharger Mon Timesheet (.xlsx)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
