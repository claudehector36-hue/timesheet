import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleBadge } from '../../components/common/Badge';
import { 
  Clock, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, users } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);
      if (!result.success) {
        setError(result.error || 'Identifiants invalides');
      }
    }, 300);
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    
    // Auto submit for smooth test UX
    setTimeout(() => {
      login(demoEmail, demoPass);
    }, 100);
  };

  const adminUser = users.find(u => u.role === 'ADMIN') || users[0];
  const managerUser = users.find(u => u.role === 'MANAGER') || users[1];
  const devUser = users.find(u => u.role === 'COLLABORATEUR') || users[2];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 relative z-10 space-y-6">
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-2">
            <Clock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Timesheet SaaS</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Portail d'authentification sécurisé. Veuillez vous connecter avec vos identifiants.
          </p>
        </div>

        {/* Security Badge */}
        <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center gap-3 text-xs text-indigo-900">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-[11px] leading-tight text-indigo-800">
            <strong>Accès Admin protégé :</strong> L'accès aux fonctionnalités d'administration requiert une authentification par mot de passe.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ex: thomas.laurent@company.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">Mot de passe</label>
              <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer hover:underline">Mot de passe oublié ?</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Presets for Instant Testing */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Comptes de démonstration
            </span>
            <span className="text-[10px] text-slate-400">Clic direct pour tester</span>
          </div>

          <div className="space-y-2">
            {/* Admin demo card */}
            <button
              type="button"
              onClick={() => handleQuickFill('thomas.laurent@company.com', 'admin123')}
              className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  A
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-rose-700">Thomas Laurent</p>
                  <p className="text-[10px] text-slate-500">Pass: <code className="font-mono bg-white px-1 py-0.5 rounded border text-rose-700 font-bold">admin123</code></p>
                </div>
              </div>
              <RoleBadge role="ADMIN" />
            </button>

            {/* Manager demo card */}
            <button
              type="button"
              onClick={() => handleQuickFill('sophie.martin@company.com', 'manager123')}
              className="w-full p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  M
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Sophie Martin</p>
                  <p className="text-[10px] text-slate-500">Pass: <code className="font-mono bg-white px-1 py-0.5 rounded border text-indigo-700 font-bold">manager123</code></p>
                </div>
              </div>
              <RoleBadge role="MANAGER" />
            </button>

            {/* Collaborateur demo card */}
            <button
              type="button"
              onClick={() => handleQuickFill('alexandre.dubois@company.com', 'user123')}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  C
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-slate-800">Alexandre Dubois</p>
                  <p className="text-[10px] text-slate-500">Pass: <code className="font-mono bg-white px-1 py-0.5 rounded border text-slate-700 font-bold">user123</code></p>
                </div>
              </div>
              <RoleBadge role="COLLABORATEUR" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
