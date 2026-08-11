import React, { useState } from 'react';
import { Modal } from './Modal';
import { ShieldAlert, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => boolean;
  targetAdminName?: string;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetAdminName = 'Administrateur',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const success = onConfirm(password);
    if (success) {
      setPassword('');
      onClose();
    } else {
      setError('Mot de passe administrateur incorrect.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPassword('');
        setError(null);
        onClose();
      }}
      title="Accès Administrateur Protégé"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-900">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-rose-950 text-xs">Vérification de sécurité requise</p>
            <p className="text-[11px] text-rose-800 mt-0.5">
              Pour basculer vers le profil Admin (<strong>{targetAdminName}</strong>), veuillez saisir le mot de passe administrateur.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-100 text-rose-800 font-bold rounded-xl border border-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe Admin</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Saisissez le mot de passe Admin"
              required
              autoFocus
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Indice de démo : <code className="font-mono text-rose-600 font-bold bg-slate-100 px-1 py-0.5 rounded">admin123</code>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              setPassword('');
              setError(null);
              onClose();
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Déverrouiller Admin
          </button>
        </div>
      </form>
    </Modal>
  );
};
