import React from 'react';
import { History, Clock, MapPin, Eye, CheckCircle, ShieldCheck } from 'lucide-react';
import { Presence, Pointage } from '../../types';

interface MobileHistoryProps {
  agentId: string;
  presences: Presence[];
  pointages: Pointage[];
  onInspectPhoto: (ptg: Pointage) => void;
}

export const MobileHistory: React.FC<MobileHistoryProps> = ({
  agentId,
  presences,
  pointages,
  onInspectPhoto,
}) => {
  const agentPresences = presences.filter((p) => p.userId === agentId);
  const agentPointages = pointages.filter((p) => p.userId === agentId);

  return (
    <div className="p-4 space-y-4 font-poppins animate-fadeIn pb-20">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <History className="w-5 h-5 text-[#0F9D58]" />
        <h2 className="text-lg font-bold text-gray-900">Historique de mes Pointages</h2>
      </div>

      {agentPointages.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 space-y-2 border border-gray-200">
          <Clock className="w-10 h-10 mx-auto text-gray-300" />
          <p className="text-xs font-medium">Aucun pointage enregistré aujourd'hui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agentPointages.map((ptg) => (
            <div
              key={ptg.id}
              onClick={() => onInspectPhoto(ptg)}
              className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-xs flex items-center gap-3 cursor-pointer hover:border-[#0F9D58] transition-all"
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                <img src={ptg.photoUrl} alt={ptg.type} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 uppercase">{ptg.type}</span>
                  <span className="text-xs font-extrabold text-[#0F9D58]">{ptg.formattedTime}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0F9D58] shrink-0" />
                  <span className="truncate">{ptg.adresse}</span>
                </div>
              </div>

              <button className="p-1.5 text-gray-400 hover:text-[#0F9D58] shrink-0">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
