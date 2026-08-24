import React, { useState } from 'react';
import { History, Calendar, MapPin, CheckCircle2, XCircle, ShieldCheck, Eye } from 'lucide-react';
import { Presence, Pointage } from '../../types';

interface MobileHistoryProps {
  agentId?: string;
  presences?: Presence[];
  pointages?: Pointage[];
  onInspectPhoto?: (ptg: Pointage) => void;
}

export const MobileHistory: React.FC<MobileHistoryProps> = ({
  agentId,
  presences = [],
  pointages = [],
  onInspectPhoto,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'checkin' | 'checkout'>('all');

  const safePresences = Array.isArray(presences) ? presences : [];
  const safePointages = Array.isArray(pointages) ? pointages : [];

  const agentPresences = safePresences.filter((p) => p && (!agentId || p.userId === agentId));
  const agentPointages = safePointages.filter((p) => {
    if (!p) return false;
    const matchesUser = !agentId || p.userId === agentId;
    if (!matchesUser) return false;
    if (filterType === 'all') return true;
    if (filterType === 'checkin') return p.type === 'check-in';
    if (filterType === 'checkout') return p.type === 'check-out';
    return true;
  });

  const totalUserPointages = safePointages.filter((p) => p && (!agentId || p.userId === agentId)).length;
  const totalArrivees = safePointages.filter((p) => p && (!agentId || p.userId === agentId) && p.type === 'check-in').length;
  const totalDeparts = safePointages.filter((p) => p && (!agentId || p.userId === agentId) && p.type === 'check-out').length;

  return (
    <div className="p-4 space-y-4 font-poppins animate-fadeIn pb-28">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#0F9D58] flex items-center justify-center shadow-2xs">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">Historique Personnel</h3>
            <p className="text-[11px] text-gray-500">Journal de vos présences & pointages GPS</p>
          </div>
        </div>
        <span className="text-[11px] font-bold bg-emerald-100 text-[#0F9D58] px-2.5 py-1 rounded-full shadow-2xs">
          {agentPointages.length} pointage{agentPointages.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            filterType === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tous ({totalUserPointages})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('checkin')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            filterType === 'checkin' ? 'bg-white text-[#0F9D58] shadow-xs' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Arrivées ({totalArrivees})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('checkout')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
            filterType === 'checkout' ? 'bg-white text-rose-600 shadow-xs' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Départs ({totalDeparts})
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-[#0F9D58] flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-medium">Jours Validés</p>
            <p className="text-base font-extrabold text-[#0F9D58]">
              {agentPresences.filter((p) => p.statut === 'Présent').length}
            </p>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-medium">Pointages Total</p>
            <p className="text-base font-extrabold text-amber-700">{agentPointages.length}</p>
          </div>
        </div>
      </div>

      {/* Pointages List */}
      {agentPointages.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Aucun pointage trouvé</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Vos pointages avec photo et localisation GPS s'afficheront ici automatiquement dès que vous effectuerez un Check-In ou Check-Out.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {agentPointages.map((ptg, index) => {
            const isCheckIn = ptg.type === 'check-in';
            const ptgKey = ptg.id || `ptg-idx-${index}`;
            const timeDisplay = ptg.formattedTime || (ptg.timestamp ? new Date(ptg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--');
            const dateDisplay = ptg.formattedDate || (ptg.timestamp ? new Date(ptg.timestamp).toLocaleDateString('fr-FR') : "Aujourd'hui");

            return (
              <div
                key={ptgKey}
                onClick={() => onInspectPhoto && onInspectPhoto(ptg)}
                className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs flex items-center gap-3 cursor-pointer hover:border-[#0F9D58] hover:shadow-sm transition-all active:scale-99"
              >
                {/* Photo Thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 flex items-center justify-center">
                  {ptg.photoUrl ? (
                    <img
                      src={ptg.photoUrl}
                      alt={isCheckIn ? 'Arrivée' : 'Départ'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <History className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Pointage Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        isCheckIn
                          ? 'bg-emerald-100 text-[#0F9D58]'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isCheckIn ? 'Arrivée (Check-in)' : 'Départ (Check-out)'}
                    </span>
                    <span className="text-xs font-extrabold text-gray-900">
                      {timeDisplay}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1">
                    <MapPin className="w-3 h-3 text-[#0F9D58] shrink-0" />
                    <span className="truncate">{ptg.adresse || 'Avenue Jean Paul II, Cotonou, Bénin'}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateDisplay}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <ShieldCheck className="w-3 h-3" /> GPS Conforme
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};