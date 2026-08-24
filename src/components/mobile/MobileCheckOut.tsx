import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Camera,
  ExternalLink,
  LogOut,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  Satellite,
  AlertTriangle,
  Navigation,
} from 'lucide-react';
import { User } from '../../types';
import { getCurrentGpsLocation, GpsLocationResult, DEFAULT_BENIN_LOCATION } from '../../lib/geoService';

interface MobileCheckOutProps {
  agent: User;
  onPerformCheckOut: (photoUrl: string, address?: string, coords?: { lat: number; lng: number }) => void;
  onOpenCameraModal: () => void;
  photoCaptured: string | null;
  checkInTime: string;
}

export const MobileCheckOut: React.FC<MobileCheckOutProps> = ({
  agent,
  onPerformCheckOut,
  onOpenCameraModal,
  photoCaptured,
  checkInTime = '07:45',
}) => {
  const [gpsLocation, setGpsLocation] = useState<GpsLocationResult>(DEFAULT_BENIN_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAcquired, setGpsAcquired] = useState(false);

  useEffect(() => {
    fetchRealLocation();
  }, []);

  const fetchRealLocation = async () => {
    setIsLocating(true);
    setGpsError(null);
    try {
      const loc = await getCurrentGpsLocation();
      setGpsLocation(loc);
      setGpsAcquired(loc.isLive);
    } catch (err: any) {
      console.warn('Real GPS fetch error on checkout:', err);
      setGpsError(
        err?.code === 1
          ? 'Autorisation GPS refusée. Veuillez autoriser la localisation.'
          : 'Recherche du signal satellite en cours.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleCheckoutSubmit = () => {
    const photoToUse =
      photoCaptured || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
    onPerformCheckOut(photoToUse, gpsLocation.formattedAddress, {
      lat: gpsLocation.latitude,
      lng: gpsLocation.longitude,
    });
  };

  return (
    <div className="p-4 space-y-4 font-poppins animate-fadeIn pb-20">
      {/* Header Info */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              ARRIVÉE ENREGISTRÉE
            </span>
            <p className="text-sm font-extrabold text-gray-900">{checkInTime} (Aujourd'hui)</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-emerald-200">
            <ShieldCheck className="w-3 h-3" /> En poste
          </span>
        </div>
      </div>

      {/* Real GPS Position Détectée Box */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full ${gpsAcquired ? 'bg-emerald-50 text-[#0F9D58]' : 'bg-rose-50 text-rose-600'} flex items-center justify-center shrink-0`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                POSITION GPS DÉPART
              </span>
              <span className="text-[11px] font-semibold text-gray-700">
                {gpsAcquired ? `Signal verrouillé (±${gpsLocation.accuracy}m)` : 'Position GPS estimée'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchRealLocation}
            disabled={isLocating}
            className="text-[11px] text-rose-600 font-bold hover:bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Scan...' : 'GPS'}</span>
          </button>
        </div>

        {gpsError && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Real OSM Map Preview */}
        <div className="relative h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
          <iframe
            title="Checkout GPS Map"
            src={gpsLocation.osmEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 bg-black/75 text-white text-[9px] px-2 py-0.5 rounded-md font-mono z-10">
            {gpsLocation.latitude.toFixed(5)}°, {gpsLocation.longitude.toFixed(5)}°
          </div>
          <a
            href={gpsLocation.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 bg-white/95 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 border border-gray-200 z-10"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-rose-600" />
          </a>
        </div>

        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
          <p className="text-xs font-semibold text-gray-800 leading-snug flex items-start gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
            <span>{gpsLocation.formattedAddress}</span>
          </p>
        </div>
      </div>

      {/* Photo Capture Card for Checkout */}
      <div className="bg-white rounded-2xl p-4 border border-dashed border-rose-300 shadow-xs space-y-3">
        {photoCaptured ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={photoCaptured} alt="Selfie Départ" className="w-full h-44 object-cover" />
            <div className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" /> Photo validée
            </div>
            <button
              onClick={onOpenCameraModal}
              className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-xl font-medium hover:bg-black/80 flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" /> Reprendre
            </button>
          </div>
        ) : (
          <div
            onClick={onOpenCameraModal}
            className="p-4 rounded-xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Photo de fin de service</p>
                <p className="text-[10px] text-gray-400">Preuve obligatoire pour le check-out</p>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
              +
            </span>
          </div>
        )}
      </div>

      {/* Big Red CHECK-OUT Button */}
      <button
        onClick={handleCheckoutSubmit}
        className="w-full py-4 bg-[#bb0112] hover:bg-[#a0010f] text-white font-extrabold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
      >
        <LogOut className="w-5 h-5" />
        <span>CHECK-OUT (FIN DE POSTE)</span>
      </button>
    </div>
  );
};