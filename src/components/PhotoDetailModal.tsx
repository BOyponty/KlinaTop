import React from 'react';
import { X, MapPin, Clock, Calendar, ShieldCheck, ExternalLink } from 'lucide-react';
import { Pointage, Presence } from '../types';

interface PhotoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointage?: Pointage | null;
  presence?: Presence | null;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  isOpen,
  onClose,
  pointage,
  presence,
}) => {
  if (!isOpen) return null;

  const photo =
    pointage?.photoUrl ||
    presence?.photoCheckinUrl ||
    presence?.photoCheckoutUrl ||
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
  const name = pointage?.userName || presence?.userName || 'Agent';
  const poste = pointage?.userPoste || presence?.userPoste || "Agent d'entretien";
  const equipe = pointage?.equipeNom || presence?.equipeNom || 'Équipe Matin A';
  const time = pointage?.formattedTime || presence?.heureCheckin || '08:00';
  const dateStr = pointage?.formattedDate || presence?.date || new Date().toLocaleDateString('fr-FR');
  const address = pointage?.adresse || presence?.adresseCheckin || 'Avenue Jean Paul II, Cotonou, Bénin';
  const latVal =
    typeof pointage?.latitude === 'number'
      ? pointage.latitude
      : parseFloat(String(pointage?.latitude || '6.3774')) || 6.3774;
  const lngVal =
    typeof pointage?.longitude === 'number'
      ? pointage.longitude
      : parseFloat(String(pointage?.longitude || '2.3903')) || 2.3903;

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lngVal - 0.005}%2C${latVal - 0.005}%2C${lngVal + 0.005}%2C${latVal + 0.005}&layer=mapnik&marker=${latVal}%2C${lngVal}`;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${latVal},${lngVal}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F2937] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F9D58]" />
            <h3 className="font-semibold text-base">Preuve de pointage certifiée</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Main Photo Card */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-black">
            <img src={photo} alt="Preuve de présence" className="w-full h-64 object-cover" />
            <div className="absolute top-3 right-3 bg-[#0F9D58] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> GPS & Photo Certifiés
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <p className="font-bold text-lg">{name}</p>
              <p className="text-xs text-gray-200">
                {poste} • {equipe}
              </p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-100 text-[#0F9D58] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block">
                  Heure certifiée
                </span>
                <span className="text-xs font-bold text-gray-900">{time}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider block">
                  Date
                </span>
                <span className="text-xs font-bold text-gray-900">{dateStr}</span>
              </div>
            </div>
          </div>

          {/* Real GPS Location & Map Box */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#0F9D58] font-bold text-xs">
                <MapPin className="w-4 h-4" />
                <span className="uppercase tracking-wider">Position GPS de Prise de Vue</span>
              </div>
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#0F9D58] font-bold flex items-center gap-1 hover:underline"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs font-semibold text-gray-800 leading-snug">{address}</p>

            {/* Map Frame */}
            <div className="relative h-28 rounded-lg overflow-hidden border border-gray-200">
              <iframe
                title="Pointage GPS Location"
                src={osmUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
              <div className="absolute top-1.5 left-1.5 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                {latVal.toFixed(5)}°, {lngVal.toFixed(5)}°
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-[11px] text-gray-400 font-mono">
            {pointage?.id || presence?.id || 'PTG-ID'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1F2937] text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};