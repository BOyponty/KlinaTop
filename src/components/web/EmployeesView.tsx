import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Phone, Mail, Filter, Users, Shield, CheckCircle2 } from 'lucide-react';
import { User, Equipe } from '../../types';

interface EmployeesViewProps {
  users: User[];
  equipes: Equipe[];
  onOpenAddModal: () => void;
  onToggleStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  users,
  equipes,
  onOpenAddModal,
  onToggleStatus,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipeFilter, setSelectedEquipeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.telephone.includes(searchTerm);

    const matchesEquipe = selectedEquipeFilter === 'ALL' || u.equipeId === selectedEquipeFilter;

    return matchesSearch && matchesEquipe;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">Gestion des Employés</h2>
          <p className="text-xs text-gray-500 font-poppins mt-0.5">
            Affichage de {filteredUsers.length} agent(s) sur {users.length} enregistrés
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-[#0F9D58] hover:bg-[#0c8047] text-white font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">+ Ajouter un employé</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, poste, téléphone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50/50 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-500 font-medium">Équipe:</span>
            <select
              value={selectedEquipeFilter}
              onChange={(e) => setSelectedEquipeFilter(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer"
            >
              <option value="ALL">Toutes les équipes</option>
              {equipes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">NOM</th>
                <th className="py-3.5 px-5">POSTE</th>
                <th className="py-3.5 px-5">ÉQUIPE</th>
                <th className="py-3.5 px-5">TÉLÉPHONE</th>
                <th className="py-3.5 px-5">STATUT</th>
                <th className="py-3.5 px-5 text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs font-poppins">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-gray-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-200 shadow-xs">
                      {u.photoUrl ? (
                        <img src={u.photoUrl} alt={u.nom} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center text-white font-bold text-xs ${
                            u.avatarBg || 'bg-emerald-600'
                          }`}
                        >
                          {u.initiales}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{u.nom}</p>
                      <p className="text-[11px] text-gray-400 font-normal">{u.email}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-gray-700 font-medium">{u.poste}</td>

                  <td className="py-3.5 px-5 text-gray-600">
                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-gray-700 font-medium text-[11px]">
                      {u.equipeNom}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-gray-600 font-medium">{u.telephone}</td>

                  <td className="py-3.5 px-5">
                    <button
                      onClick={() => onToggleStatus(u.id)}
                      title="Cliquer pour changer le statut"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        u.statut === 'Actif'
                          ? 'bg-emerald-100 text-[#0F9D58] hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${u.statut === 'Actif' ? 'bg-[#0F9D58]' : 'bg-gray-400'}`}
                      ></span>
                      {u.statut}
                    </button>
                  </td>

                  <td className="py-3.5 px-5 text-right space-x-2">
                    <button
                      onClick={() => onToggleStatus(u.id)}
                      className="p-1.5 text-gray-500 hover:text-[#0F9D58] hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Modifier le statut"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(u.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer l'employé"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-gray-50/50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>
            Affichage de {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} à{' '}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} sur {filteredUsers.length} résultats
          </span>

          <div className="flex gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white font-medium"
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg font-semibold ${
                  currentPage === i + 1
                    ? 'bg-[#0F9D58] text-white'
                    : 'border border-gray-200 hover:bg-white text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-white font-medium"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
