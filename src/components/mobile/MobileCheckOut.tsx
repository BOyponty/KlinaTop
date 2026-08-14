import React, { useState } from 'react';
import { Clock, MapPin, Camera, ExternalLink, LogOut, CheckCircle, ShieldCheck } from 'lucide-react';
import { User } from '../../types';

interface MobileCheckOutProps {
  agent: User;
  onPerformCheckOut: (photoUrl: string) => void;
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
  const [address, setAddress] = useState('Site Marina, Cotonou, Bénin');

  const handleCheckoutSubmit = () => {
    const photoToUse =
      photoCaptured || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600';
    onPerformCheckOut(photoToUse);
  };

  return (
    <div className="p-4 space-y-4 font-poppins animate-fadeIn pb-20">
      {/* End of Shift Title */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500 font-medium">Fin de Journée • {new Date().toLocaleDateString('fr-FR')}</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-0.5">Fin de Poste</h2>
        <p className="text-xs text-gray-500 mt-1">Prêt à valider votre départ ?</p>
      </div>

      {/* Hours Worked Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0F9D58] flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            HEURES TRAVAILLÉES AUJOURD'HUI
          </span>
          <div className="text-3xl font-extrabold text-[#0F9D58] mt-1">
            8<span className="text-sm text-gray-500 font-bold ml-0.5">h</span> 15
            <span className="text-sm text-gray-500 font-bold ml-0.5">m</span>
          </div>
        </div>

        <div className="w-full border-t border-gray-100 pt-3 grid grid-cols-2 text-xs">
          <div>
            <span className="text-gray-400 font-medium block">CHECK-IN</span>
            <span className="font-bold text-gray-900">{checkInTime}</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium block">ACTUEL</span>
            <span className="font-bold text-gray-900">
              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Position Détectée Box */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              POSITION DÉTECTÉE
            </span>
            <p className="text-xs font-bold text-gray-900">{address}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => alert(`Position GPS confirmée: ${address}`)}
          className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Carte</span> <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Photo Capture Card for Checkout */}
      <div
        onClick={onOpenCameraModal}
        className="bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 hover:border-rose-400 shadow-xs cursor-pointer transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-gray-900">Prendre une photo de fin</h3>
            <p className="text-[11px] text-gray-400">Preuve de fin de nettoyage du site</p>
          </div>
        </div>

        {photoCaptured ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-rose-500 shrink-0">
            <img src={photoCaptured} alt="Photo fin de poste" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-lg">
            +
          </div>
        )}
      </div>

      {/* Big Red CHECK-OUT Button */}
      <button
        onClick={handleCheckoutSubmit}
        className="w-full py-4 bg-[#bb0112] hover:bg-[#a0010f] text-white font-extrabold text-base rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
      >
        <LogOut className="w-5 h-5" />
        <span>CHECK-OUT (FIN DE POSTE)</span>
      </button>
    </div>
  );
};
