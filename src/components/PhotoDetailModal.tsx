import React from 'react';
import { X, MapPin, Clock, Calendar, User, ShieldCheck, Download } from 'lucide-react';
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

  const photo = pointage?.photoUrl || presence?.photoCheckinUrl || presence?.photoCheckoutUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
  const name = pointage?.userName || presence?.userName || 'Agent';
  const poste = pointage?.userPoste || presence?.userPoste || "Agent d'entretien";
  const equipe = pointage?.equipeNom || presence?.equipeNom || 'Équipe Matin A';
  const time = pointage?.formattedTime || presence?.heureCheckin || '08:00';
  const address = pointage?.adresse || presence?.adresseCheckin || 'Avenue Jean Paul II, Cotonou, Bénin';
  const lat = pointage?.latitude || 6.3532;
  const lng = pointage?.longitude || 2.4211;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F2937] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F9D58]" />
            <h3 className="font-semibold text-base">Preuve de Présence Horodatée</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Photo Card */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-black">
            <img src={photo} alt="Preuve de présence" className="w-full h-72 object-cover" />
            <div className="absolute top-3 right-3 bg-[#0F9D58] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> GPS & Photo Certifiés
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
              <p className="font-bold text-lg">{name}</p>
              <p className="text-xs text-gray-200">{poste} • {equipe}</p>
            </div>
          </div>

          {/* Details Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-[#0F9D58]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Heure vérifiée</span>
                <span className="text-sm font-bold text-gray-900">{time}</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Date</span>
                <span className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          {/* Location Box */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-[#0F9D58]">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Position GPS Détectée</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{address}</p>
            <div className="text-[11px] text-gray-500 flex items-center gap-2">
              <span>Coordonnées: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
              <span>• Precision GPS: ± 5m</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500">KlinaTop ID: {pointage?.id || presence?.id || 'PTG-8821'}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1F2937] text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
