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
}

export const MobileCheckIn: React.FC<MobileCheckInProps> = ({
  agent,
  onPerformCheckIn,
  onOpenCameraModal,
  photoCaptured,
  onGoToCheckoutScreen,
  isCheckedIn,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [address, setAddress] = useState('Avenue Jean Paul II, Cotonou, Bénin');
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
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
          <h2 className="text-xl font-bold text-gray-900 leading-tight">Bonjour, {firstName} 👋</h2>
          <p className="text-xs text-gray-500 capitalize">{currentDate}</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0F9D58] shadow-xs">
          <img src={agent.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'} alt={agent.nom} className="w-full h-full object-cover" />
        </div>
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

      {/* Live Real-time Clock Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-[#0F9D58]"></div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D58] animate-pulse"></span>
          <span className="text-xs font-bold text-[#0F9D58] uppercase tracking-wider">
            {isCheckedIn ? 'En Poste' : 'Hors Poste (Prêt au Check-in)'}
          </span>
        </div>
        <div className="text-3xl font-extrabold text-gray-900 tracking-tight my-1">{currentTime}</div>
        <p className="text-[11px] text-gray-400 font-medium">Équipe: {agent.equipeNom}</p>
      </div>

      {/* Position Détectée Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs">
            <MapPin className="w-4 h-4 text-[#0F9D58]" />
            <span>Position détectée</span>
          </div>
          <button
            onClick={handleGetLocation}
            title="Rafraîchir ma position GPS"
            className="text-[11px] text-[#0F9D58] font-semibold flex items-center gap-1 hover:underline"
          >
            <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} /> GPS
          </button>
        </div>

        {/* Mini Interactive Map Simulation */}
        <div className="relative h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=600"
            alt="Carte GPS"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div className="bg-[#0F9D58] text-white p-2 rounded-full shadow-lg ring-4 ring-emerald-400/40 animate-bounce">
              <Navigation className="w-4 h-4 fill-white" />
            </div>
          </div>
          <div className="absolute bottom-1.5 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
            📍 Cotonou, Bénin
          </div>
        </div>

        <p className="text-xs text-gray-700 font-medium leading-snug">{address}</p>
      </div>

      {/* Photo Capture Card */}
      <div
        onClick={onOpenCameraModal}
        className="bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 hover:border-[#0F9D58] shadow-xs cursor-pointer transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0F9D58] flex items-center justify-center shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-gray-900">Prendre une photo</h3>
            <p className="text-[11px] text-gray-400">Obligatoire pour la validation de l'arrivée</p>
          </div>
        </div>

        {photoCaptured ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-[#0F9D58] shrink-0">
            <img src={photoCaptured} alt="Vignette photo" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0F9D58] flex items-center justify-center font-bold text-lg">
            +
          </div>
        )}
      </div>

      {/* Big Green CHECK-IN Button */}
      <button
        onClick={() => {
          const photoToUse =
            photoCaptured || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600';
          onPerformCheckIn(photoToUse, address);
        }}
        disabled={isCheckedIn}
        className="w-full py-4 bg-[#0F9D58] hover:bg-[#0c8047] disabled:bg-gray-300 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
      >
        <CheckCircle className="w-5 h-5" />
        <span>{isCheckedIn ? 'DÉJÀ CHECK-IN (EN POSTE)' : 'CHECK-IN (ARRIVÉE)'}</span>
      </button>
    </div>
  );
};
