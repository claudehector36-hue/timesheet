import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { RoleBadge } from '../../components/common/Badge';
import { User, UserRole } from '../../types';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Edit3, 
  UserCheck, 
  UserX, 
  Mail, 
  Shield, 
  Euro
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('TOUS');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('COLLABORATEUR');
  const [team, setTeam] = useState('Équipe Tech & Dev');
  const [title, setTitle] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(600);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [active, setActive] = useState(true);

  const filteredUsers = users.filter(u => {
    if (selectedRoleFilter !== 'TOUS' && u.role !== selectedRoleFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(term) ||
             u.email.toLowerCase().includes(term) ||
             u.team.toLowerCase().includes(term) ||
             u.title.toLowerCase().includes(term);
    }
    return true;
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setUserToEdit(user);
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setTeam(user.team);
      setTitle(user.title);
      setDailyRate(user.dailyRate || 600);
      setAvatarUrl(user.avatarUrl || '');
      setActive(user.active);
    } else {
      setUserToEdit(null);
      setName('');
      setEmail('');
      setRole('COLLABORATEUR');
      setTeam('Équipe Tech & Dev');
      setTitle('Consultant Senior');
      setDailyRate(600);
      setAvatarUrl('');
      setActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const hourlyRate = Math.round(dailyRate / 7.5);

    if (userToEdit) {
      updateUser({
        ...userToEdit,
        name: name.trim(),
        email: email.trim(),
        role,
        team: team.trim(),
        title: title.trim(),
        dailyRate: Number(dailyRate),
        hourlyRate,
        avatarUrl: avatarUrl.trim() || undefined,
        active,
      });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        role,
        team: team.trim(),
        title: title.trim(),
        dailyRate: Number(dailyRate),
        hourlyRate,
        avatarUrl: avatarUrl.trim() || undefined,
        active,
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
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Gestion des Utilisateurs & Rôles</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gérez l'ensemble des comptes utilisateurs, les droits d'accès et la répartition par équipes.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, équipe..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={selectedRoleFilter}
            onChange={e => setSelectedRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
          >
            <option value="TOUS">Tous les Rôles</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="MANAGER">Managers</option>
            <option value="COLLABORATEUR">Collaborateurs</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Utilisateur</th>
                <th className="py-3.5 px-4">Rôle</th>
                <th className="py-3.5 px-4">Équipe & Poste</th>
                <th className="py-3.5 px-4 text-center">TJM (€/j)</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[10px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800">{user.team}</p>
                    <p className="text-[10px] text-slate-500">{user.title}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                    {user.dailyRate ? `${user.dailyRate} €` : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.active 
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' 
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.active ? 'Désactiver le compte' : 'Activer le compte'}
                      >
                        {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={userToEdit ? 'Modifier l\'Utilisateur' : 'Créer un Utilisateur'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Paul Martin"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Professionnel</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Ex: p.martin@company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rôle Système</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="COLLABORATEUR">Collaborateur</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Équipe</label>
              <input
                type="text"
                value={team}
                onChange={e => setTeam(e.target.value)}
                placeholder="Ex: Équipe Tech & Dev"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé de Poste</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Architecte Cloud Senior"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">TJM (€/jour)</label>
              <input
                type="number"
                min="0"
                value={dailyRate}
                onChange={e => setDailyRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">URL Avatar (Unsplash / Photo)</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="activeCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Compte utilisateur actif
            </label>
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
