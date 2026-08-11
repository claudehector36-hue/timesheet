import React, { useState, useRef, useEffect } from 'react';
import { 
  useApp 
} from '../../context/AppContext';
import { 
  RoleBadge 
} from '../common/Badge';
import { AdminPasswordModal } from '../common/AdminPasswordModal';
import { 
  Bell, 
  Search, 
  User as UserIcon, 
  ChevronDown, 
  LogOut, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Clock,
  Menu,
  X,
  Sparkles,
  Lock
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, isMobileSidebarOpen }) => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    verifyAdminPassword,
    logout,
    notifications, 
    markNotificationRead, 
    resetToInitialData,
    setActiveTab
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  
  // Admin password modal state
  const [pendingAdminUserId, setPendingAdminUserId] = useState<string | null>(null);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) {
        setShowRoleSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (u: typeof users[0]) => {
    setShowRoleSwitcher(false);
    if (u.id === currentUser.id) return;

    // If switching to an ADMIN account and currently not ADMIN, require password!
    if (u.role === 'ADMIN' && currentUser.role !== 'ADMIN') {
      setPendingAdminUserId(u.id);
    } else {
      switchUser(u.id);
    }
  };

  const handleConfirmAdminPassword = (pass: string) => {
    const isValid = verifyAdminPassword(pass);
    if (isValid && pendingAdminUserId) {
      switchUser(pendingAdminUserId);
      setPendingAdminUserId(null);
      return true;
    }
    return false;
  };

  const pendingAdminUser = users.find(u => u.id === pendingAdminUserId);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100"
            aria-label="Menu Mobile"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">Timesheet</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">SaaS</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-none hidden sm:block">Gestion des temps & budgets</p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une mission, client, collaborateur..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
            />
          </div>
        </div>

        {/* Right: Quick Role Switcher, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher */}
          <div className="relative" ref={roleSwitcherRef}>
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 text-xs font-medium transition-all"
              title="Tester un autre rôle utilisateur"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Rôle :</span>
              <span className="font-bold text-indigo-700">{currentUser.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-900">Changer d'utilisateur / rôle</p>
                  <p className="text-[11px] text-slate-500">Basculez entre profils (Mot de passe requis pour Admin)</p>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors ${u.id === currentUser.id ? 'bg-indigo-50/60 font-semibold' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-slate-900 font-medium leading-tight flex items-center gap-1">
                            {u.name}
                            {u.role === 'ADMIN' && <Lock className="w-3 h-3 text-rose-500" title="Protégé par mot de passe" />}
                          </p>
                          <p className="text-[10px] text-slate-500">{u.team}</p>
                        </div>
                      </div>
                      <RoleBadge role={u.role} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {unreadCount} nouvelle(s)
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">Aucune notification</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkTab) setActiveTab(n.linkTab as any);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${!n.read ? 'bg-indigo-50/20' : ''}`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                            <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative border-l border-slate-200 pl-2 sm:pl-3" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-none">{currentUser.name}</p>
                <div className="mt-0.5 flex items-center gap-1">
                  <RoleBadge role={currentUser.role} />
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  <p className="text-[11px] text-indigo-600 mt-0.5 font-medium">{currentUser.title}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    Mon profil & Paramètres
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Voulez-vous réinitialiser toutes les données de démonstration ?')) {
                        resetToInitialData();
                        setShowUserDropdown(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-500" />
                    Réinitialiser les données démo
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Password Modal when switching to Admin account */}
      <AdminPasswordModal
        isOpen={!!pendingAdminUserId}
        onClose={() => setPendingAdminUserId(null)}
        onConfirm={handleConfirmAdminPassword}
        targetAdminName={pendingAdminUser?.name}
      />
    </header>
  );
};
