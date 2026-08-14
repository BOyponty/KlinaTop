import React, { useState } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, ArrowRight, Phone, Mail, UserPlus, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';
import { KlinaTopLogo } from '../common/KlinaTopLogo';

interface MobileLoginProps {
  onLogin: (agent: User) => void;
  onRegisterAgent?: (newUser: User) => void;
  availableAgents: User[];
}

export const MobileLogin: React.FC<MobileLoginProps> = ({ onLogin, onRegisterAgent, availableAgents }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [identifier, setIdentifier] = useState('armel.koko@klinatop.bj');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register state for Cleaning Agent (Agent d'entretien)
  const [regNom, setRegNom] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEquipe, setRegEquipe] = useState('Équipe Alpha (Cotonou)');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const matched =
      availableAgents.find(
        (a) => a.email.toLowerCase() === identifier.toLowerCase() || a.telephone.includes(identifier)
      ) || availableAgents[0];

    onLogin(matched);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNom.trim() || !regPhone.trim()) {
      setErrorMsg('Veuillez saisir votre Nom complet et Téléphone.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsSubmitting(false);
      const newAgent: User = {
        id: `usr-${Date.now()}`,
        nom: regNom.trim(),
        email: regEmail.trim() || `${regNom.toLowerCase().replace(/\s+/g, '.')}@klinatop.bj`,
        telephone: regPhone.trim(),
        role: 'agent',
        poste: "Agent d'entretien",
        equipeId: regEquipe.includes('Alpha') ? 'eq-1' : 'eq-2',
        equipeNom: regEquipe,
        statut: 'Actif',
        initiales: regNom.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AG',
        photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
      };

      setSuccessMsg('Compte agent créé avec succès ! Prise de poste activée...');
      if (onRegisterAgent) {
        onRegisterAgent(newAgent);
      }
      setTimeout(() => {
        onLogin(newAgent);
      }, 800);
    }, 700);
  };

  return (
    <div className="flex flex-col min-h-[640px] justify-between p-5 bg-[#F5F7FA] font-poppins animate-fadeIn">
      {/* Official Recommended KlinaTop Logo Header */}
      <div className="flex flex-col items-center pt-2 text-center">
        <KlinaTopLogo variant="compact" size="md" lightBackground={true} />
      </div>

      {/* Mode Switcher: Connexion vs Créer un compte Agent */}
      <div className="flex rounded-xl bg-gray-200/80 p-1 my-3 border border-gray-300/80">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'login' ? 'bg-[#0F9D58] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'register' ? 'bg-[#0F9D58] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Créer un compte
        </button>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-medium text-center">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 text-xs font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0F9D58]" />
          <span>{successMsg}</span>
        </div>
      )}

      {mode === 'login' ? (
        /* LOGIN FORM FOR EXISTING AGENT */
        <form onSubmit={handleLoginSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-3.5 my-auto">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Téléphone ou Email Agent</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ex. +229 97 12 34 56"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#0F9D58] focus:bg-white focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#0F9D58] focus:bg-white focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#0F9D58] cursor-pointer accent-[#0F9D58]"
              />
              <span className="text-gray-600 font-medium">Se souvenir de moi</span>
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#0F9D58] font-semibold hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Se connecter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* REGISTER FORM FOR NEW CLEANING AGENT (Agent d'entretien) */
        <form onSubmit={handleRegisterSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-3 my-auto">
          <div className="text-center pb-1 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-800">Inscription Nouveau Agent d'Entretien</p>
            <p className="text-[10px] text-gray-500">Créez votre identifiant pour vos pointages terrain</p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Nom & Prénom Agent</label>
            <div className="relative">
              <UserIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={regNom}
                onChange={(e) => setRegNom(e.target.value)}
                placeholder="ex: KOKO C. Armel"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#0F9D58] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Téléphone Mobile</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="ex: +229 97 00 11 22"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#0F9D58] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Email (Optionnel)</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="ex: armel.koko@klinatop.bj"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#0F9D58] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Créer un Mot de passe</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#0F9D58] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Équipe / Site Affecté</label>
            <select
              value={regEquipe}
              onChange={(e) => setRegEquipe(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:border-[#0F9D58] outline-none"
            >
              <option value="Équipe Alpha (Cotonou)">Équipe Alpha (Cotonou)</option>
              <option value="Équipe BêtA (Calavi)">Équipe BêtA (Calavi)</option>
              <option value="Équipe Gamma (Porto-Novo)">Équipe Gamma (Porto-Novo)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {isSubmitting ? (
              <span>Création du compte...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Créer mon compte Agent</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer Support */}
      <p className="text-[11px] text-center text-gray-500 font-medium pb-2">
        Problème de connexion ?{' '}
        <span
          onClick={() => alert('Support Terrain KlinaTop: Appelez le +229 01 97 00 00 pour assistance immediate.')}
          className="text-[#0F9D58] font-bold underline cursor-pointer"
        >
          Contacter le support
        </span>
      </p>
    </div>
  );
};
