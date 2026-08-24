import React, { useState, useEffect } from 'react';
import { MapPin, Camera, Clock, Navigation, CheckCircle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { User } from '../../types';

interface MobileCheckInProps {
  agent: User;
  onPerformCheckIn: (photoUrl: string, address: string) => void;
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
  const [address, setAddress] = useState('Avenue Jean Paul II, Cotonou, Bénin');
  const [isLocating, setIsLocating] = useState(false);

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

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setAddress(`Avenue Jean Paul II, Cotonou, Bénin (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {
          setIsLocating(false);
          setAddress('Avenue Jean Paul II, Cotonou, Bénin');
        },
        { timeout: 5000 }
      );
    } else {
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
            <img src={agent.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'} alt={agent.nom} className="w-full h-full object-cover" />
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

        <p className="text-xs text-gray-400 font-medium">Équipe: {agent.equipeNom || 'Équipe Alpha (Cotonou)'}</p>
      </div>

      {/* GPS Location Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <MapPin className="w-4 h-4 text-[#0F9D58]" />
            <span>Position détectée</span>
          </div>
          <button
            onClick={handleGetLocation}
            disabled={isLocating}
            className="text-[11px] text-[#0F9D58] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
            <span>GPS</span>
          </button>
        </div>

        <div className="relative h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600"
            alt="Map Preview"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-emerald-950/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#0F9D58] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
            <MapPin className="w-3 h-3 text-red-400" />
            <span>Cotonou, Bénin</span>
          </div>
        </div>

        <p className="text-xs text-gray-600 font-medium leading-relaxed">{address}</p>
      </div>

      {/* Photo Capture Area */}
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
              className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-xl font-medium hover:bg-black/80 flex items-center gap-1.5 backdrop-blur-xs"
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

      {/* Main Check-In CTA Button */}
      <button
        onClick={() => {
          if (!photoCaptured) {
            onOpenCameraModal();
            return;
          }
          onPerformCheckIn(photoCaptured, address);
        }}
        className="w-full py-4 rounded-2xl bg-[#0F9D58] hover:bg-[#0c8047] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 transition-all cursor-pointer"
      >
        <CheckCircle className="w-5 h-5" />
        <span>CHECK-IN (ARRIVÉE)</span>
      </button>
    </div>
  );
};