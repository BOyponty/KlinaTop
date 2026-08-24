import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Camera,
  Navigation,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Satellite,
  AlertTriangle,
} from 'lucide-react';
import { User } from '../../types';
import { getCurrentGpsLocation, GpsLocationResult, DEFAULT_BENIN_LOCATION } from '../../lib/geoService';

interface MobileCheckInProps {
  agent: User;
  onPerformCheckIn: (photoUrl: string, address: string, coords?: { lat: number; lng: number }) => void;
  onOpenCameraModal: () => void;
  photoCaptured: string | null;
  onGoToCheckoutScreen: () => void;
  isCheckedIn: boolean;
  onLogout?: () => void;
  onNavigateToProfile?: () => void;
}

export const MobileCheckIn: React.FC<MobileCheckInProps> = ({
  agent,
  onPerformCheckIn,
  onOpenCameraModal,
  photoCaptured,
  onGoToCheckoutScreen,
  isCheckedIn,
  onLogout,
  onNavigateToProfile,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState<'Bonjour' | 'Bonsoir'>('Bonjour');
  
  // Real GPS state
  const [gpsLocation, setGpsLocation] = useState<GpsLocationResult>(DEFAULT_BENIN_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsAcquired, setGpsAcquired] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentHour = now.getHours();
      // Au Bénin : Avant 12h = Bonjour, À partir de 12h (après-midi & soirée) = Bonsoir
      setGreeting(currentHour >= 12 ? 'Bonsoir' : 'Bonjour');
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real GPS on mount
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
      console.warn('Real GPS fetch error:', err);
      setGpsError(
        err?.code === 1
          ? 'Autorisation GPS refusée. Veuillez autoriser la géolocalisation dans votre navigateur pour détecter votre position exacte.'
          : 'Recherche du signal satellite en cours. Position estimée chargée.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const firstName = agent.nom.split(' ')[0] || agent.nom;

  return (
    <div className="p-4 space-y-4 font-poppins animate-fadeIn pb-20">
      {/* Greeting Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{greeting}, {firstName} 👋</h2>
          <p className="text-xs text-gray-500 capitalize">{currentDate}</p>
        </div>
        <button
          onClick={onNavigateToProfile || onLogout}
          title="Mon profil & Déconnexion"
          className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0F9D58] shadow-xs">
            <img
              src={agent.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
              alt={agent.nom}
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>

      {/* Already Checked-in Alert */}
      {isCheckedIn && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#0F9D58] font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>Vous êtes actuellement EN POSTE</span>
          </div>
          <button
            onClick={onGoToCheckoutScreen}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
          >
            Aller au Check-Out
          </button>
        </div>
      )}

      {/* Digital Clock Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-emerald-50 text-[#0F9D58]">
          <span className="w-2 h-2 rounded-full bg-[#0F9D58] animate-ping" />
          <span>{isCheckedIn ? 'EN POSTE (ACTIF)' : 'HORS POSTE (PRÊT AU CHECK-IN)'}</span>
        </div>

        <div className="text-4xl font-extrabold text-gray-900 tracking-tight font-mono my-1">
          {currentTime || '08:00:00'}
        </div>

        <p className="text-[11px] text-gray-400 font-medium">Équipe: {agent.equipeNom}</p>
      </div>

      {/* Real Position Détectée Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xs">
            <div className={`p-1.5 rounded-lg ${gpsAcquired ? 'bg-emerald-100 text-[#0F9D58]' : 'bg-blue-50 text-blue-600'}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="block">Position GPS exacte</span>
              <span className="text-[10px] font-normal text-gray-500">
                {gpsAcquired ? (
                  <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                    <Satellite className="w-3 h-3" /> Signal verrouillé (Précision ±{gpsLocation.accuracy}m)
                  </span>
                ) : (
                  'Recherche du signal satellite...'
                )}
              </span>
            </div>
          </div>
          <button
            onClick={fetchRealLocation}
            disabled={isLocating}
            title="Rafraîchir ma position GPS exacte"
            className="text-[11px] text-[#0F9D58] font-bold hover:bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Scan...' : 'GPS'}</span>
          </button>
        </div>

        {gpsError && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <span>{gpsError}</span>
              <button
                onClick={fetchRealLocation}
                className="block text-[#0F9D58] font-bold mt-1 underline cursor-pointer"
              >
                Autoriser / Réessayer la détection GPS
              </button>
            </div>
          </div>
        )}

        {/* Real Interactive Map Display (OpenStreetMap) */}
        <div className="relative h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
          <iframe
            title="Real GPS Map"
            src={gpsLocation.osmEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
          {/* Floating Badge with Exact Coordinates */}
          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-mono shadow-md z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              {gpsLocation.latitude.toFixed(5)}°, {gpsLocation.longitude.toFixed(5)}°
            </span>
          </div>

          {/* Quick Open in Google Maps */}
          <a
            href={gpsLocation.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 bg-white/95 hover:bg-white text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center gap-1 border border-gray-200 transition-transform active:scale-95 z-10"
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3 text-[#0F9D58]" />
          </a>
        </div>

        {/* Real Address Display */}
        <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
          <p className="text-xs font-semibold text-gray-800 leading-relaxed flex items-start gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#0F9D58] shrink-0 mt-0.5" />
            <span>{gpsLocation.formattedAddress}</span>
          </p>
        </div>
      </div>

      {/* Photo Capture Card */}
      <div className="bg-white rounded-2xl p-4 border border-dashed border-emerald-300 shadow-xs space-y-3">
        {photoCaptured ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={photoCaptured} alt="Selfie" className="w-full h-44 object-cover" />
            <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5" />
              Photo validée
            </div>
            <button
              onClick={onOpenCameraModal}
              className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-xl font-medium hover:bg-black/80 flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              Reprendre
            </button>
          </div>
        ) : (
          <div
            onClick={onOpenCameraModal}
            className="p-4 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-[#0F9D58] flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Prendre une photo</p>
                <p className="text-[10px] text-gray-400">Obligatoire pour la validation de l'arrivée</p>
              </div>
            </div>
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-[#0F9D58] flex items-center justify-center font-bold text-sm">
              +
            </span>
          </div>
        )}
      </div>

      {/* Big Green CHECK-IN Button */}
      <button
        onClick={() => {
          if (!photoCaptured) {
            onOpenCameraModal();
            return;
          }
          onPerformCheckIn(photoCaptured, gpsLocation.formattedAddress, {
            lat: gpsLocation.latitude,
            lng: gpsLocation.longitude,
          });
        }}
        disabled={isCheckedIn}
        className="w-full py-4 bg-[#0F9D58] hover:bg-[#0c8047] disabled:bg-gray-300 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
      >
        <CheckCircle className="w-5 h-5" />
        <span>{isCheckedIn ? 'DÉJÀ CHECK-IN (EN POSTE)' : 'CHECK-IN (ARRIVÉE)'}</span>
      </button>
    </div>
  );
};