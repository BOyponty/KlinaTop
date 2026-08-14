import React, { useState } from 'react';
import { X, User, Mail, Phone, Briefcase, Users, Plus, Check } from 'lucide-react';
import { User as UserType, Equipe } from '../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipes: Equipe[];
  onAddEmployee: (newEmployee: UserType) => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  equipes,
  onAddEmployee,
}) => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+229 ');
  const [poste, setPoste] = useState("Agent d'entretien");
  const [equipeId, setEquipeId] = useState(equipes[0]?.id || 'eq-1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    const selectedEquipe = equipes.find((e) => e.id === equipeId);
    const selectedEquipeNom = selectedEquipe ? selectedEquipe.nom : 'Équipe Matin A';

    const parts = nom.trim().split(' ');
    const initiales =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : nom.slice(0, 2).toUpperCase();

    const newEmp: UserType = {
      id: `usr-${Date.now()}`,
      nom: nom.trim(),
      email: email.trim() || `${nom.toLowerCase().replace(/\s+/g, '.')}@klinatop.bj`,
      telephone: telephone.trim() || '+229 97 00 11 22',
      role: 'agent',
      poste,
      equipeId,
      equipeNom: selectedEquipeNom,
      statut: 'Actif',
      initiales,
      avatarBg: 'bg-emerald-600',
    };

    onAddEmployee(newEmp);
    setNom('');
    setEmail('');
    setTelephone('+229 ');
    onClose();
  };

  const setPreset = (presetNom: string, presetPoste: string) => {
    setNom(presetNom);
    setPoste(presetPoste);
    setEmail(`${presetNom.toLowerCase().replace(/[^a-z]/g, '')}@klinatop.bj`);
    setTelephone(`+229 97 ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1F2937] text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F9D58] flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-base">Ajouter un employé</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Suggestions rapide (Noms Béninois)
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPreset('HOUNGUE V. Rodrigue', "Agent d'entretien")}
                className="text-xs bg-emerald-50 text-[#0F9D58] px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                + HOUNGUE V. Rodrigue
              </button>
              <button
                type="button"
                onClick={() => setPreset('KPADONOU Syntyche', 'Agent de Propreté')}
                className="text-xs bg-emerald-50 text-[#0F9D58] px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                + KPADONOU Syntyche
              </button>
              <button
                type="button"
                onClick={() => setPreset('KPANOU Fabrice', 'Technicien Surface')}
                className="text-xs bg-emerald-50 text-[#0F9D58] px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                + KPANOU Fabrice
              </button>
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nom complet <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="ex. KOKO C. Armel"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
              />
            </div>
          </div>

          {/* Poste */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Poste / Fonction</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none bg-white"
              >
                <option value="Agent d'entretien">Agent d'entretien</option>
                <option value="Agent d'entretien Senior">Agent d'entretien Senior</option>
                <option value="Technicien de Surface">Technicien de Surface</option>
                <option value="Agent Polyvalente">Agent Polyvalente</option>
                <option value="Chef d'équipe Terrain">Chef d'équipe Terrain</option>
                <option value="Superviseur">Superviseur</option>
              </select>
            </div>
          </div>

          {/* Équipe */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Équipe attribuée</label>
            <div className="relative">
              <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={equipeId}
                onChange={(e) => setEquipeId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none bg-white"
              >
                {equipes.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.nom} ({eq.horaire})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Téléphone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+229 97 00 00 00"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@klinatop.bj"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#0F9D58] text-white font-semibold text-sm rounded-xl hover:bg-[#0c8047] transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Enregistrer l'employé
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
