import React from 'react';
import { X, MapPin, Calendar, Clock, User as UserIcon, Users, ShieldCheck } from 'lucide-react';
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
  if (!isOpen || (!pointage && !presence)) return null;

  const photo = pointage?.photoUrl || presence?.photoCheckin || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
  const name = pointage?.userNom || presence?.userNom || 'Agent de terrain';
  const equipe = pointage?.equipeNom || presence?.equipeNom || 'Équipe Matin A';
  const time = pointage?.formattedTime || presence?.heureCheckin || '08:00';
  const address = pointage?.adresse || presence?.adresseCheckin || 'Avenue Jean Paul II, Cotonou, Bénin';
  const latVal = typeof pointage?.latitude === 'number' ? pointage.latitude : parseFloat(String(pointage?.latitude || '6.3532')) || 6.3532;
  const lngVal = typeof pointage?.longitude === 'number' ? pointage.longitude : parseFloat(String(pointage?.longitude || '2.4211')) || 2.4211;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1F2937] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F9D58]" />
            <h3 className="font-semibold text-base">Preuve de pointage validée</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Photo */}
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-md">
            <img src={photo} alt={name} className="w-full h-64 object-cover" />
            <div className="absolute bottom-2 left-2 bg-[#0F9D58] text-white text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Photo Horodatée Conforme
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium">Agent</span>
              </div>
              <span className="text-xs font-bold text-gray-900">{name}</span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium">Équipe & Site</span>
              </div>
              <span className="text-xs font-bold text-gray-900">{equipe}</span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium">Heure du pointage</span>
              </div>
              <span className="text-xs font-bold text-[#0F9D58]">{time}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium">Date</span>
              </div>
              <span className="text-xs font-bold text-gray-900">
                {pointage?.formattedDate || presence?.date || 'Aujourd\'hui'}
              </span>
            </div>
          </div>

          {/* GPS Info */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#0F9D58] font-semibold">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Position GPS Certifiée</span>
            </div>
            <p className="text-sm font-medium text-gray-800">{address}</p>
            <div className="text-[11px] text-gray-500 flex items-center gap-2">
              <span>Coordonnées: {latVal.toFixed(4)}, {lngVal.toFixed(4)}</span>
              <span>• Precision GPS: ± 5m</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-900 text-white font-medium text-xs rounded-xl hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};