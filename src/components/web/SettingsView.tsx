import React, { useState } from 'react';
import { Settings, Users, Clock, Building, Bell, Shield, Save, Check } from 'lucide-react';
import { Equipe } from '../../types';

interface SettingsViewProps {
  equipes: Equipe[];
  onUpdateEquipes: (equipes: Equipe[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ equipes, onUpdateEquipes }) => {
  const [companyName, setCompanyName] = useState('KlinaTop Bénin SARL');
  const [companyAddress, setCompanyAddress] = useState('Immeuble Triennal, Boulevard de la Marina, Cotonou');
  const [gpsTolerance, setGpsTolerance] = useState('200'); // meters
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">Paramètres du Système</h2>
        <p className="text-xs text-gray-500 font-poppins mt-0.5">
          Gestion des équipes de nettoyage, tolérance GPS et profil entreprise
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#0F9D58] rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <Check className="w-5 h-5" />
          <span>Paramètres KlinaTop enregistrés avec succès.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Profile */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-base font-poppins border-b border-gray-100 pb-3">
            <Building className="w-5 h-5 text-[#0F9D58]" /> Profil Entreprise de Nettoyage
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Raison Sociale</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Adresse Siège Social</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* GPS & Verification Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-base font-poppins border-b border-gray-100 pb-3">
            <Shield className="w-5 h-5 text-[#0F9D58]" /> Configuration GPS & Pointage
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Rayon de Tolérance GPS (Mètres)
              </label>
              <input
                type="number"
                value={gpsTolerance}
                onChange={(e) => setGpsTolerance(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Distance maximale autorisée entre l'agent et le site attribué.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <input
                type="checkbox"
                defaultChecked
                id="photoReq"
                className="w-4 h-4 text-[#0F9D58] rounded border-gray-300 focus:ring-[#0F9D58]"
              />
              <label htmlFor="photoReq" className="text-xs font-semibold text-gray-800 cursor-pointer">
                Exiger systématiquement une photo horodatée au Check-in et Check-out
              </label>
            </div>
          </div>
        </div>

        {/* Teams Management */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base font-poppins">
              <Users className="w-5 h-5 text-[#0F9D58]" /> Équipes & Horaires de Travail
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipes.map((eq) => (
              <div key={eq.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-gray-900">{eq.nom}</h4>
                  <span className="text-[10px] font-bold text-[#0F9D58] bg-emerald-100 px-2 py-0.5 rounded-full">
                    {eq.nombreMembres} membres
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>Plage Horaire: {eq.horaire}</span>
                </div>
                <p className="text-[11px] text-gray-500">{eq.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Enregistrer les paramètres
        </button>
      </form>
    </div>
  );
};
