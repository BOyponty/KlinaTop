import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Camera,
  Calendar,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { User, Presence, Pointage } from '../../types';

interface DashboardViewProps {
  users: User[];
  presences: Presence[];
  pointages: Pointage[];
  onNavigate: (tab: any) => void;
  onInspectPhoto: (pointage: Pointage) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  users,
  presences,
  pointages,
  onNavigate,
  onInspectPhoto,
}) => {
  const [selectedDate, setSelectedDate] = useState('Aujourd\'hui');

  // Stats calculation
  const totalEmployees = users.length;
  const presentsCount = presences.filter((p) => p.statut === 'présent' || p.statut === 'en_poste').length;
  const absentsCount = presences.filter((p) => p.statut === 'absent').length;
  const gpsCheckinsCount = pointages.length;
  const photosUploadedCount = pointages.filter((p) => p.photoUrl).length;

  const presentPercentage = totalEmployees > 0 ? Math.round((presentsCount / totalEmployees) * 100) : 0;
  const absentPercentage = totalEmployees > 0 ? Math.round((absentsCount / totalEmployees) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">Aperçu du Tableau de Bord</h2>
          <p className="text-sm text-gray-500 font-poppins mt-0.5">
            Suivi en temps réel des présences de l'équipe de nettoyage KlinaTop
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 shadow-xs cursor-pointer hover:border-[#0F9D58] transition-colors">
          <Calendar className="w-4 h-4 text-[#0F9D58]" />
          <span className="text-xs font-semibold text-gray-700">Aujourd'hui, 12 Août 2026</span>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Employés */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500">Total Employés</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalEmployees}</h3>
        </div>

        {/* Présents */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F9D58] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#0F9D58] bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> {presentPercentage}%
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500">Présents</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{presentsCount}</h3>
        </div>

        {/* Absents */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
              <ArrowDownRight className="w-3 h-3" /> {absentPercentage}%
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500">Absents</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{absentsCount}</h3>
        </div>

        {/* Check-in GPS */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500">Check-in GPS</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{gpsCheckinsCount}</h3>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500">Photos Prises</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{photosUploadedCount}</h3>
        </div>
      </div>

      {/* Main Content Layout: Table (Left 2 cols) + Recent Pointages Feed (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table "Présences du jour" */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-bold text-base text-gray-900 font-poppins">Présences du jour</h3>
              <p className="text-xs text-gray-500">Feuille d'émargement automatique avec preuves photo/GPS</p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-[#0F9D58] font-semibold text-xs hover:underline flex items-center gap-1"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">NOM</th>
                  <th className="py-3 px-4">ÉQUIPE</th>
                  <th className="py-3 px-4">CHECK-IN</th>
                  <th className="py-3 px-4">STATUT</th>
                  <th className="py-3 px-4">LOCALISATION</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {presences.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-3">
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
                          <p className="text-[11px] text-gray-500 font-normal">{p.userPoste}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 font-medium">{p.equipeNom}</td>

                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {p.heureCheckin ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" /> {p.heureCheckin}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">--:--</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
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

                      <td className="py-3.5 px-4 text-gray-600 max-w-[160px] truncate">
                        {p.adresseCheckin ? (
                          <span className="flex items-center gap-1 truncate text-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#0F9D58] shrink-0" />
                            <span className="truncate">{p.adresseCheckin.split(',')[0]}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">--</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
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
                            title="Inspecter photo & GPS"
                            className="p-1.5 text-[#0F9D58] hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Eye className="w-4 h-4" /> Preuve
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs">Aucune</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel "Pointages récents" */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900 font-poppins">Pointages récents</h3>
              <span className="text-[10px] font-semibold bg-emerald-100 text-[#0F9D58] px-2 py-0.5 rounded-full">
                En direct
              </span>
            </div>

            <div className="space-y-4">
              {pointages.map((ptg) => (
                <div
                  key={ptg.id}
                  onClick={() => onInspectPhoto(ptg)}
                  className="p-3 bg-gray-50 hover:bg-emerald-50/50 rounded-xl border border-gray-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                      <img src={ptg.photoUrl} alt={ptg.userName} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center font-bold">
                        {ptg.formattedTime}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs text-gray-900 truncate group-hover:text-[#0F9D58] transition-colors">
                          {ptg.userName}
                        </p>
                        <span className="text-[10px] font-bold text-[#0F9D58] bg-emerald-100 px-1.5 py-0.5 rounded-md uppercase">
                          {ptg.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">{ptg.userPoste}</p>

                      <div className="flex items-center gap-1 text-[11px] text-gray-600 mt-1 truncate">
                        <MapPin className="w-3 h-3 text-[#0F9D58] shrink-0" />
                        <span className="truncate">{ptg.adresse}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('pointages')}
            className="mt-6 w-full py-2.5 text-center text-[#0F9D58] font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1"
          >
            Voir tous les pointages (Flux GPS) <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
