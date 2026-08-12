import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '../types';
import { Modal } from '../components/Modal';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  Mail, 
  Building, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  UserX,
  UserCheck
} from 'lucide-react';

interface UsersManagementViewProps {
  users: User[];
  onCreateUser: (userData: Partial<User>) => void;
  onUpdateUser: (id: string, userData: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  onCreateUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Deletion confirm modal
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [department, setDepartment] = useState('Consulting');
  const [dailyRate, setDailyRate] = useState(550);
  const [weeklyCapacity, setWeeklyCapacity] = useState(35);
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const openCreateModal = () => {
    setEditingUser(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('USER');
    setDepartment('Consulting');
    setDailyRate(550);
    setWeeklyCapacity(35);
    setStatus('ACTIVE');
    setPassword('User123!');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFirstName(u.firstName);
    setLastName(u.lastName);
    setEmail(u.email);
    setRole(u.role);
    setDepartment(u.department);
    setDailyRate(u.dailyRate);
    setWeeklyCapacity(u.weeklyCapacity);
    setStatus(u.status);
    setPassword(''); // leave blank if unchanged
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      firstName,
      lastName,
      email,
      role,
      department,
      dailyRate: Number(dailyRate),
      weeklyCapacity: Number(weeklyCapacity),
      status
    };

    if (password && password.trim().length > 0) {
      payload.password = password.trim();
    }

    if (editingUser) {
      onUpdateUser(editingUser.id, payload);
    } else {
      onCreateUser(payload);
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (u: User) => {
    const newStatus: UserStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    onUpdateUser(u.id, { status: newStatus });
  };

  const handleConfirmDeactivate = () => {
    if (deletingUser) {
      onUpdateUser(deletingUser.id, { status: 'INACTIVE' });
      setDeletingUser(null);
    }
  };

  const handleConfirmForceDelete = () => {
    if (deletingUser) {
      onDeleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email} ${u.department}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gestion des Utilisateurs & Rôles</h2>
          <p className="text-xs text-slate-500">Gérez les comptes collaborateurs, leurs mots de passe, capacités hebdomadaires et permissions d'accès.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filtrer par Rôle :</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ADMIN">ADMINISTRATEUR</option>
            <option value="MANAGER">MANAGER</option>
            <option value="USER">COLLABORATEUR (USER)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Département</th>
                <th className="py-3 px-4">Rôle</th>
                <th className="py-3 px-4 text-right">TJM (€)</th>
                <th className="py-3 px-4 text-center">Capacité (h/sem)</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const roleBadge = u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  u.role === 'MANAGER' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-emerald-50 text-emerald-700 border-emerald-200';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                          {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{u.department}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadge}`}>
                        {u.role === 'ADMIN' ? 'ADMINISTRATEUR' : u.role === 'MANAGER' ? 'MANAGER' : 'COLLABORATEUR'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">{u.dailyRate} €</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-800">{u.weeklyCapacity} h</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title="Cliquer pour modifier le statut"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center space-x-1 cursor-pointer transition-all ${
                          u.status === 'ACTIVE' 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Actif</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 text-rose-600" />
                            <span>Inactif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(u)}
                          title="Modifier les données et mot de passe"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          title="Supprimer ou désactiver"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Modifier ${editingUser.firstName} ${editingUser.lastName}` : "Créer un Nouvel Utilisateur"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Prénom</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nom</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Professionnel</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {editingUser ? "Réinitialiser le Mot de Passe (laisser vide si inchangé)" : "Mot de Passe Initial"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={editingUser ? "•••••••• (inchangé)" : "ex: User123!"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rôle Système</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="USER">COLLABORATEUR (USER)</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMINISTRATEUR</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Département / Équipe</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">TJM - Taux Journalier (€)</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Capacité Hebdo (heures)</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={weeklyCapacity}
                onChange={(e) => setWeeklyCapacity(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Statut du Compte</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ACTIVE">Actif (Accès Autorisé)</option>
              <option value="INACTIVE">Inactif (Accès Bloqué)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
            >
              {editingUser ? "Enregistrer les modifications" : "Créer l'utilisateur"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Deactivate Confirmation Modal */}
      {deletingUser && (
        <Modal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          title="Confirmation de suppression ou désactivation"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Attention - Intégrité des données</p>
                <p>
                  Êtes-vous sûr de vouloir supprimer l'utilisateur <strong className="text-slate-900">{deletingUser.firstName} {deletingUser.lastName}</strong> ?
                  Cette action peut entraîner la suppression ou l'archivage de ses saisies de temps et de son historique budgétaire.
                </p>
              </div>
            </div>

            <p className="text-slate-600">
              💡 <strong>Recommandation :</strong> Désactiver le compte empêche l'utilisateur de se connecter tout en conservant l'intégralité de son historique de présence et de facturation.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                Désactiver le compte (Recommandé)
              </button>
              <button
                type="button"
                onClick={handleConfirmForceDelete}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
