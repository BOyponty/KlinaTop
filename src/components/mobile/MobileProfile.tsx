import React from 'react';
import { User as UserIcon, Phone, Mail, Users, Clock, ShieldCheck, LogOut } from 'lucide-react';
import { User } from '../../types';

interface MobileProfileProps {
  agent: User;
  onLogout: () => void;
}

export const MobileProfile: React.FC<MobileProfileProps> = ({ agent, onLogout }) => {
  return (
    <div className="p-4 space-y-4 font-poppins animate-fadeIn pb-20">
      {/* Avatar Box */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col items-center text-center space-y-2">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#0F9D58] shadow-md bg-gray-100">
          <img
            src={agent.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
            alt={agent.nom}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-bold text-base text-gray-900">{agent.nom}</h3>
          <p className="text-xs font-semibold text-[#0F9D58]">{agent.poste}</p>
        </div>
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-[#0F9D58] px-3 py-0.5 rounded-full text-[11px] font-bold">
          <ShieldCheck className="w-3.5 h-3.5" /> Agent Vérifié
        </span>
      </div>

      {/* Details List */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <span className="text-gray-500 font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> Équipe attribuée
          </span>
          <span className="font-bold text-gray-900">{agent.equipeNom}</span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <span className="text-gray-500 font-medium flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" /> Téléphone
          </span>
          <span className="font-bold text-gray-900">{agent.telephone}</span>
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <span className="text-gray-500 font-medium flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" /> Email professionnel
          </span>
          <span className="font-bold text-gray-900">{agent.email}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" /> Statut Compte
          </span>
          <span className="font-bold text-[#0F9D58] bg-emerald-50 px-2.5 py-0.5 rounded-full">
            {agent.statut}
          </span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200"
      >
        <LogOut className="w-4 h-4" /> Se déconnecter du terminal
      </button>
    </div>
  );
};
