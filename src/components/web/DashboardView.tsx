import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Camera,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Sparkles,
  Info,
  CalendarDays,
} from 'lucide-react';
import { User, Presence, Pointage } from '../../types';
import {
  getTodayISO,
  formatFullFrenchDate,
  formatShortDate,
  addDays,
  isToday,
  isYesterday,
  isFuture,
} from '../../utils/dateUtils';
import { CalendarDropdown } from '../common/CalendarDropdown';

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
  // Current selected date (defaults to dynamic today date ISO, e.g. "2026-08-31")
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());

  const isSelectedToday = isToday(selectedDate);
  const isSelectedYesterday = isYesterday(selectedDate);

  // Quick navigation handlers
  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    if (!isFuture(addDays(selectedDate, 1))) {
      setSelectedDate((prev) => addDays(prev, 1));
    }
  };

  const handleResetToToday = () => {
    setSelectedDate(getTodayISO());
  };

  // 1. Filter / Synthesize Presences for the selected date
  // We match active employees to either existing presence records for this date, or present default status
  const existingPresencesForDate = presences.filter((p) => p.date === selectedDate);

  const displayedPresences: Presence[] = users
    .filter((u) => u.statut === 'Actif' && u.role === 'agent')
    .map((user) => {
      const found = existingPresencesForDate.find((p) => p.userId === user.id);
      if (found) {
        return found;
      }
      // If no presence recorded for this date:
      return {
        id: `synth-${user.id}-${selectedDate}`,
        userId: user.id,
        userName: user.nom,
        userPoste: user.poste,
        userPhoto: user.photoUrl,
        equipeNom: user.equipeNom,
        date: selectedDate,
        heureCheckin: null,
        heureCheckout: null,
        duree: '0h 0m',
        dureeMinutes: 0,
        statut: 'absent',
      } as Presence;
    });

  // 2. Filter Pointages for the selected date
  const pointagesForSelectedDate = pointages.filter((ptg) => {
    // Timestamp matching selected date
    const ptgDate = ptg.timestamp ? ptg.timestamp.split('T')[0] : '';
    return ptgDate === selectedDate;
  });

  // Fallback to all recent pointages if none found on a historical date so feed stays informative
  const displayedPointages =
    pointagesForSelectedDate.length > 0 ? pointagesForSelectedDate : pointages.slice(0, 5);

  // 3. Stats calculation for the chosen date
  const totalEmployees = users.filter((u) => u.role === 'agent' && u.statut === 'Actif').length;
  const presentsCount = displayedPresences.filter(
    (p) => p.statut === 'présent' || p.statut === 'en_poste'
  ).length;
  const retardsCount = displayedPresences.filter((p) => p.statut === 'retard').length;
  const absentsCount = displayedPresences.filter((p) => p.statut === 'absent').length;
  const gpsCheckinsCount = pointagesForSelectedDate.length > 0 
    ? pointagesForSelectedDate.length 
    : isSelectedToday 
      ? pointages.length 
      : presentsCount;
  const photosUploadedCount = pointagesForSelectedDate.length > 0
    ? pointagesForSelectedDate.filter((p) => p.photoUrl).length
    : isSelectedToday
      ? pointages.filter((p) => p.photoUrl).length
      : displayedPresences.filter((p) => p.photoCheckinUrl).length;

  const presentPercentage =
    totalEmployees > 0 ? Math.round(((presentsCount + retardsCount) / totalEmployees) * 100) : 0;
  const absentPercentage =
    totalEmployees > 0 ? Math.round((absentsCount / totalEmployees) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Top Header & Date Controller */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-gray-900 font-poppins">Aperçu du Tableau de Bord</h2>
            {isSelectedToday ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#0F9D58] border border-emerald-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D58]"></span> En Direct
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                <CalendarDays className="w-3.5 h-3.5" /> Historique ({formatShortDate(selectedDate)})
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-poppins mt-0.5">
            {isSelectedToday
              ? "Suivi en temps réel des présences de l'équipe de nettoyage KlinaTop"
              : `Consultation de la feuille d'émargement et pointages du ${formatFullFrenchDate(selectedDate)}`}
          </p>
        </div>

        {/* Date Selector and Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Stepper (< >) */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-2xl border border-gray-200">
            <button
              type="button"
              onClick={handlePrevDay}
              title="Jour précédent"
              className="p-1.5 hover:bg-white text-gray-700 hover:text-[#0F9D58] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNextDay}
              disabled={isFuture(addDays(selectedDate, 1)) || isSelectedToday}
              title="Jour suivant"
              className={`p-1.5 rounded-xl transition-all cursor-pointer shadow-xs ${
                isFuture(addDays(selectedDate, 1)) || isSelectedToday
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-white text-gray-700 hover:text-[#0F9D58]'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Date Picker Dropdown with Popover Calendar */}
          <CalendarDropdown
            selectedDate={selectedDate}
            onSelectDate={(newDate) => setSelectedDate(newDate)}
            availableDatesWithData={Array.from(new Set(presences.map((p) => p.date)))}
            align="right"
          />

          {/* Quick "Aujourd'hui" reset button when viewing previous dates */}
          {!isSelectedToday && (
            <button
              type="button"
              onClick={handleResetToToday}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#0F9D58] font-bold text-xs rounded-2xl border border-emerald-200 transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Aujourd'hui</span>
            </button>
          )}
        </div>
      </div>

      {/* Historical Date Notice banner if not today */}
      {!isSelectedToday && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">Mode Historique :</span> Affichage des présences et indicateurs du{' '}
              <strong className="text-blue-950 font-bold">{formatFullFrenchDate(selectedDate)}</strong>.
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetToToday}
            className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-100/60 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors self-start sm:self-auto cursor-pointer"
          >
            Revenir au direct (Aujourd'hui)
          </button>
        </div>
      )}

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Employés */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500">Effectif Actif</p>
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
          <p className="text-xs font-medium text-gray-500">
            {isSelectedToday ? 'Présents du jour' : 'Présents le jour J'}
          </p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{presentsCount + retardsCount}</h3>
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
        {/* Table "Présences" */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-bold text-base text-gray-900 font-poppins">
                {isSelectedToday
                  ? 'Présences du jour'
                  : `Présences du ${formatShortDate(selectedDate)}`}
              </h3>
              <p className="text-xs text-gray-500">
                {isSelectedToday
                  ? "Feuille d'émargement automatique avec preuves photo/GPS en direct"
                  : `Émargement enregistré pour le ${formatFullFrenchDate(selectedDate)}`}
              </p>
            </div>
            <button
              onClick={() => onNavigate('attendance')}
              className="text-[#0F9D58] font-semibold text-xs hover:underline flex items-center gap-1 cursor-pointer"
            >
              Voir tout l'historique <ChevronRight className="w-4 h-4" />
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
                {displayedPresences.map((p) => {
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
                                formattedDate: formatShortDate(selectedDate),
                                latitude: 6.3532,
                                longitude: 2.4211,
                                adresse: p.adresseCheckin || 'Avenue Jean Paul II, Cotonou, Bénin',
                                siteName: 'Site KlinaTop',
                                photoUrl: p.photoCheckinUrl,
                              })
                            }
                            title="Inspecter photo & GPS"
                            className="p-1.5 text-[#0F9D58] hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold cursor-pointer"
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
              <h3 className="font-bold text-base text-gray-900 font-poppins">
                {pointagesForSelectedDate.length > 0 && !isSelectedToday
                  ? `Pointages (${formatShortDate(selectedDate)})`
                  : 'Pointages récents'}
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-100 text-[#0F9D58] px-2 py-0.5 rounded-full">
                {isSelectedToday ? 'En direct' : 'Archive'}
              </span>
            </div>

            <div className="space-y-4">
              {displayedPointages.map((ptg) => (
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
            className="mt-6 w-full py-2.5 text-center text-[#0F9D58] font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            Voir tous les pointages (Flux GPS) <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

