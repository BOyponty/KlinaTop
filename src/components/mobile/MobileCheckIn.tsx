import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Navigation,
  RefreshCw,
  Camera as CameraIcon,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../../types';

interface MobileCheckInProps {
  agent: User;
  onCheckIn: (photoUrl: string, address: string, coords?: { lat: number; lng: number }) => void;
  onOpenCamera: () => void;
  photoCaptured: string | null;
  isCheckedIn: boolean;
  checkInTime: string;
  onNavigateToProfile: () => void;
}

export const MobileCheckIn: React.FC<MobileCheckInProps> = ({
  agent,
  onCheckIn,
  onOpenCamera,
  photoCaptured,
  isCheckedIn,
  checkInTime,
  onNavigateToProfile,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [address, setAddress] = useState<string>('Localisation en cours...');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await resp.json();
            if (data && data.display_name) {
              const road = data.address.road || data.address.suburb || data.address.neighbourhood || '';
              const city = data.address.city || data.address.town || data.address.village || 'Cotonou';
              setAddress(road ? `${road}, ${city}, Bénin` : data.display_name.split(',').slice(0, 3).join(', '));
            } else {
              setAddress(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Cotonou, Bénin)`);
            }
          } catch {
            setAddress(`Coordonnées GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationError('GPS faible ou non autorisé. Position par défaut utilisée.');
          setAddress('Avenue Jean Paul II, Cotonou, Bénin');
          setCoords({ lat: 6.3532, lng: 2.4211 });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError('Géolocalisation non supportée.');
      setAddress('Avenue Jean Paul II, Cotonou, Bénin');
      setIsLocating(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleConfirmCheckIn = () => {
    if (!photoCaptured) {
      alert('Veuillez prendre une photo selfie pour valider votre pointage.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      onCheckIn(photoCaptured, address, coords || undefined);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="flex-1 p-4 space-y-4 font-poppins pb-24 overflow-y-auto">
      {/* Header Agent */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#0F9D58] shadow-xs flex items-center justify-center bg-emerald-600 text-white font-bold text-base">
            {agent.photoUrl ? (
              <img src={agent.photoUrl} alt={agent.nom} className="w-full h-full object-cover" />
            ) : (
              <span>{agent.initiales || (agent.nom ? agent.nom.slice(0, 2).toUpperCase() : 'AG')}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{agent.nom}</h3>
            <p className="text-xs text-gray-500">{agent.poste}</p>
            <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {agent.equipeNom}
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateToProfile}
          title="Mon profil & Déconnexion"
          className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0F9D58] shadow-xs flex items-center justify-center bg-emerald-600 text-white font-bold text-xs">
            {agent.photoUrl ? (
              <img src={agent.photoUrl} alt={agent.nom} className="w-full h-full object-cover" />
            ) : (
              <span>{agent.initiales || (agent.nom ? agent.nom.slice(0, 2).toUpperCase() : 'AG')}</span>
            )}
          </div>
        </button>
      </div>

      {/* Clock Display Card */}
      <div className="bg-gradient-to-br from-[#1F2937] to-[#111827] text-white p-5 rounded-3xl shadow-md text-center space-y-1">
        <p className="text-xs text-emerald-400 font-medium capitalize">{currentDate}</p>
        <h2 className="text-3xl font-extrabold tracking-tight font-mono text-white">{currentTime || '--:--:--'}</h2>
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold text-gray-200 mt-2">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pointage d'Arrivée (Check-In)</span>
        </div>
      </div>

      {/* Geolocation Card */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#0F9D58]" /> Position GPS actuelle
          </span>
          <button
            onClick={fetchLocation}
            disabled={isLocating}
            className="text-[11px] text-[#0F9D58] font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>
        <p className="text-xs text-gray-800 font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-start gap-2">
          <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{isLocating ? 'Recherche des coordonnées...' : address}</span>
        </p>
        {locationError && (
          <p className="text-[10px] text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {locationError}
          </p>
        )}
      </div>

      {/* Photo Capture Section */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 space-y-3">
        <span className="block text-xs font-bold text-gray-700">Photo Selfie de vérification</span>

        {photoCaptured ? (
          <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-black border-2 border-emerald-500 shadow-sm">
            <img src={photoCaptured} alt="Selfie Check-In" className="w-full h-full object-cover" />
            <button
              onClick={onOpenCamera}
              className="absolute bottom-2.5 right-2.5 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 backdrop-blur-xs font-semibold cursor-pointer"
            >
              <CameraIcon className="w-3.5 h-3.5" /> Reprendre
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenCamera}
            className="w-full py-8 border-2 border-dashed border-emerald-400/80 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl flex flex-col items-center justify-center gap-2 text-emerald-800 transition-all active:scale-98 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#0F9D58] text-white flex items-center justify-center shadow-md">
              <CameraIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold">Prendre la photo pour valider</span>
            <span className="text-[10px] text-emerald-600">Reconnaissance faciale et preuve de présence</span>
          </button>
        )}
      </div>

      {/* Already Checked-In Notice or Action Button */}
      {isCheckedIn ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-[#0F9D58] shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Vous êtes actuellement en poste !</p>
            <p className="text-emerald-700">Check-in validé à {checkInTime}. Rendez-vous sur l'onglet Check-Out en fin de service.</p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConfirmCheckIn}
          disabled={!photoCaptured || isSubmitting}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer ${
            photoCaptured && !isSubmitting
              ? 'bg-[#0F9D58] hover:bg-[#0c8047] text-white shadow-emerald-700/20'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isSubmitting ? 'Validation du pointage...' : "Valider mon Check-In d'arrivée"}</span>
        </button>
      )}
    </div>
  );
};