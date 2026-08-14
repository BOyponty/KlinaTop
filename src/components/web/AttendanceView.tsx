import React, { useState } from 'react';
import { Filter, Download, Calendar, Search, Users, Clock, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { Presence, User, Pointage } from '../../types';
import { downloadPayrollExport } from '../../utils/exportUtils';

interface AttendanceViewProps {
  presences: Presence[];
  users: User[];
  equipes: any[];
  onInspectPhoto: (pointage: Pointage) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  presences,
  users,
  equipes,
  onInspectPhoto,
}) => {
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('2026-08-12');

  const filteredPresences = presences.filter((p) => {
    const matchesTeam = selectedTeamFilter === 'ALL' || p.equipeNom.includes(selectedTeamFilter);
    const matchesSearch = p.userName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const handleExportClick = () => {
    downloadPayrollExport('Août 2026', 'excel', filteredPresences, users);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">Feuille de Présences</h2>
          <p className="text-xs text-gray-500 font-poppins mt-0.5">
            Historique détaillé des heures d'arrivée, de départ et durées de travail
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportClick}
            className="bg-[#0F9D58] hover:bg-[#0c8047] text-white font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exporter l'Émargement</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Période / Date</label>
          <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50/50">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 outline-none w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Équipe</label>
          <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50/50">
            <Users className="w-4 h-4 text-gray-400 mr-2" />
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 outline-none w-full cursor-pointer"
            >
              <option value="ALL">Toutes les équipes</option>
              {equipes.map((eq) => (
                <option key={eq.id} value={eq.nom}>
                  {eq.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Rechercher Agent</label>
          <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 text-xs bg-gray-50/50">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom..."
              className="bg-transparent font-medium text-gray-800 outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5">NOM</th>
                <th className="py-3.5 px-5">ÉQUIPE</th>
                <th className="py-3.5 px-5">CHECK-IN</th>
                <th className="py-3.5 px-5">CHECK-OUT</th>
                <th className="py-3.5 px-5">DURÉE</th>
                <th className="py-3.5 px-5">STATUT</th>
                <th className="py-3.5 px-5 text-right">PREUVE</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs font-poppins">
              {filteredPresences.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                      {p.userPhoto ? (
                        <img src={p.userPhoto} alt={p.userName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white font-bold text-xs">
                          {p.userName.slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{p.userName}</p>
                      <p className="text-[11px] text-gray-400 font-normal">{p.userPoste}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-gray-600 font-medium">{p.equipeNom}</td>

                  <td className="py-3.5 px-5 font-semibold text-gray-800">
                    {p.heureCheckin ? (
                      <span className="text-[#0F9D58] font-bold">{p.heureCheckin}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">--:--</span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 font-semibold text-gray-800">
                    {p.heureCheckout ? (
                      <span className="text-blue-600 font-bold">{p.heureCheckout}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">--:--</span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 font-bold text-gray-900">{p.duree}</td>

                  <td className="py-3.5 px-5">
                    {p.statut === 'présent' || p.statut === 'en_poste' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-[#0F9D58] border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D58]"></span> Présent
                      </span>
                    ) : p.statut === 'retard' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Retard
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Absent
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    {p.photoCheckinUrl ? (
                      <button
                        onClick={() =>
                          onInspectPhoto({
                            id: p.id,
                            userId: p.userId,
                            userName: p.userName,
                            userPoste: p.userPoste,
                            equipeNom: p.equipeNom,
                            type: 'check-in',
                            timestamp: new Date().toISOString(),
                            formattedTime: p.heureCheckin || '08:00',
                            formattedDate: '12/08/2026',
                            latitude: 6.3532,
                            longitude: 2.4211,
                            adresse: p.adresseCheckin || 'Avenue Jean Paul II, Cotonou, Bénin',
                            siteName: 'Site KlinaTop',
                            photoUrl: p.photoCheckinUrl,
                          })
                        }
                        className="px-2.5 py-1 text-xs font-semibold text-[#0F9D58] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Voir Photo
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
