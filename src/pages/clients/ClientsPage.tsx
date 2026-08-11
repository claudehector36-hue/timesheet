import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/Badge';
import { Client } from '../../types';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  Grid, 
  List, 
  Edit3, 
  Briefcase, 
  Mail, 
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { clients, missions, timeEntries, addClient, updateClient } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [status, setStatus] = useState<'Actif' | 'Inactif'>('Actif');
  const [colorTag, setColorTag] = useState('#3b82f6');
  const [notes, setNotes] = useState('');

  const filteredClients = clients.filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) ||
           c.code.toLowerCase().includes(term) ||
           c.domain.toLowerCase().includes(term) ||
           c.contactName.toLowerCase().includes(term);
  });

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setClientToEdit(client);
      setName(client.name);
      setCode(client.code);
      setDomain(client.domain);
      setContactName(client.contactName);
      setContactEmail(client.contactEmail);
      setStatus(client.status);
      setColorTag(client.colorTag || '#3b82f6');
      setNotes(client.notes || '');
    } else {
      setClientToEdit(null);
      setName('');
      setCode('');
      setDomain('');
      setContactName('');
      setContactEmail('');
      setStatus('Actif');
      setColorTag('#3b82f6');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (clientToEdit) {
      updateClient({
        ...clientToEdit,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        domain: domain.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        status,
        colorTag,
        notes: notes.trim(),
      });
    } else {
      addClient({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        domain: domain.trim(),
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        status,
        colorTag,
        notes: notes.trim(),
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
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Gestion des Clients</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos comptes clients, coordonnées, contacts référents et portefeuilles de projets.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Nouveau Client
        </button>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un client, domaine, contact..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
          />
        </div>

        {/* Grid vs Table toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Grid className="w-4 h-4" /> Grille
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <List className="w-4 h-4" /> Tableau
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => {
            const activeMissionsCount = missions.filter(m => m.clientId === client.id && m.status === 'En cours').length;
            const consumedHours = timeEntries
              .filter(te => te.clientId === client.id)
              .reduce((sum, te) => sum + te.hours, 0);

            return (
              <div 
                key={client.id} 
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs"
                        style={{ backgroundColor: client.colorTag || '#3b82f6' }}
                      >
                        {client.code}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{client.name}</h3>
                        <p className="text-xs text-slate-500">{client.domain}</p>
                      </div>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>

                  {/* Contact box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.contactName || 'Pas de contact référent'}</span>
                    </div>
                    {client.contactEmail && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer metrics */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Missions</span>
                      <span className="font-bold text-slate-900">{activeMissionsCount} actives</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Volume</span>
                      <span className="font-mono font-bold text-indigo-600">{consumedHours} h</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(client)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    title="Modifier"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Domaine</th>
                  <th className="py-3.5 px-4">Contact référent</th>
                  <th className="py-3.5 px-4 text-center">Missions actives</th>
                  <th className="py-3.5 px-4 text-center">Heures consommées</th>
                  <th className="py-3.5 px-4 text-center">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map(client => {
                  const activeMissionsCount = missions.filter(m => m.clientId === client.id && m.status === 'En cours').length;
                  const consumedHours = timeEntries
                    .filter(te => te.clientId === client.id)
                    .reduce((sum, te) => sum + te.hours, 0);

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span 
                          className="px-2 py-0.5 rounded text-white text-[10px]"
                          style={{ backgroundColor: client.colorTag || '#3b82f6' }}
                        >
                          {client.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{client.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{client.domain}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{client.contactName}</p>
                        <p className="text-[10px] text-slate-500">{client.contactEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">{activeMissionsCount}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-600">{consumedHours} h</td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={client.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenModal(client)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={clientToEdit ? 'Modifier le Client' : 'Ajouter un nouveau Client'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nom du Client</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Acme Corp"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Code Trigramme</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex: ACME"
                maxLength={6}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Domaine d'activité</label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="Ex: Finance & Assurance, Supply Chain..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Référent</label>
              <input
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Contact</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="Ex: j.dupont@acme.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Statut Client</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:border-indigo-500"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Couleur Tag</label>
              <input
                type="color"
                value={colorTag}
                onChange={e => setColorTag(e.target.value)}
                className="w-full h-9 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
              />
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
