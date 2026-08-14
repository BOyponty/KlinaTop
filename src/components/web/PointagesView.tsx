import React from 'react';
import { MapPin, Clock, Camera, ShieldCheck, Eye, ExternalLink } from 'lucide-react';
import { Pointage } from '../../types';

interface PointagesViewProps {
  pointages: Pointage[];
  onInspectPhoto: (ptg: Pointage) => void;
}

export const PointagesView: React.FC<PointagesViewProps> = ({ pointages, onInspectPhoto }) => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">Pointages en Direct (GPS & Photos)</h2>
          <span className="bg-[#0F9D58] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
            LIVE FEED
          </span>
        </div>
        <p className="text-xs text-gray-500 font-poppins mt-0.5">
          Journal temps réel des arrivées et départs capturés depuis l'application mobile agent
        </p>
      </div>

      {/* Grid of Punch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pointages.map((ptg) => (
          <div
            key={ptg.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
          >
            {/* Photo Header with Badge Overlay */}
            <div className="relative h-48 bg-black overflow-hidden">
              <img
                src={ptg.photoUrl}
                alt={ptg.userName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-[#0F9D58] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> GPS Vérifié
              </div>
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase">
                {ptg.type}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 text-white">
                <p className="font-bold text-sm leading-tight">{ptg.userName}</p>
                <p className="text-[11px] text-gray-200">{ptg.userPoste} • {ptg.equipeNom}</p>
              </div>
            </div>

            {/* Details Body */}
            <div className="p-4 flex-1 space-y-3 bg-white">
              <div className="flex items-center justify-between text-xs text-gray-700 font-semibold border-b border-gray-100 pb-2">
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4 text-[#0F9D58]" /> Horodatage:
                </span>
                <span className="text-gray-900 font-bold">{ptg.formattedTime} ({ptg.formattedDate})</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Adresse Détectée
                </span>
                <div className="flex items-start gap-1.5 text-xs text-gray-800 font-medium">
                  <MapPin className="w-4 h-4 text-[#0F9D58] shrink-0 mt-0.5" />
                  <p className="leading-snug">{ptg.adresse}</p>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-mono">ID: {ptg.id}</span>
              <button
                onClick={() => onInspectPhoto(ptg)}
                className="text-[#0F9D58] hover:text-[#0b7843] font-bold text-xs flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Inspecter grand format
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
