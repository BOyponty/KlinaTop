import React, { useState } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, ArrowRight, Phone, Mail, UserPlus, CheckCircle2, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { User } from '../../types';
import { KlinaTopLogo } from '../common/KlinaTopLogo';

interface MobileLoginProps {
  onLogin: (agent: User) => void;
  onRegisterAgent?: (newUser: User) => void;
  availableAgents: User[];
}

export const MobileLogin: React.FC<MobileLoginProps> = ({ onLogin, onRegisterAgent, availableAgents }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Field error flags for visual red border highlighting
  const [errorField, setErrorField] = useState<'identifier' | 'password' | 'regNom' | 'regPhone' | 'regPassword' | 'forgotQuery' | null>(null);

  // Register state for Cleaning Agent (Agent d'entretien)
  const [regNom, setRegNom] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEquipe, setRegEquipe] = useState('Équipe Alpha (Cotonou)');

  // Forgot password state
  const [forgotQuery, setForgotQuery] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotHelpContact, setForgotHelpContact] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const resetMessagesAndErrors = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setErrorField(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessagesAndErrors();
    const cleanQuery = identifier.trim().toLowerCase().replace(/\s+/g, '');
    const cleanInputPass = password.trim();

    if (!cleanQuery) {
      setErrorField('identifier');
      setErrorMsg('Veuillez saisir votre numéro de téléphone ou email.');
      return;
    }

    if (!cleanInputPass) {
      setErrorField('password');
      setErrorMsg('Veuillez saisir votre mot de passe.');
      return;
    }

    // Search exact matching agent by phone or email
    const matched = availableAgents.find((a) => {
      const cleanPhone = (a.telephone || '').toLowerCase().replace(/[\s+]/g, '');
      const cleanEmail = (a.email || '').toLowerCase().trim();
      const cleanSearch = cleanQuery.replace(/[\s+]/g, '');
      return (
        cleanPhone === cleanSearch ||
        cleanPhone.endsWith(cleanSearch) ||
        cleanEmail === identifier.trim().toLowerCase()
      );
    });

    if (!matched) {
      setErrorField('identifier');
      setErrorMsg("Aucun compte agent trouvé avec ce numéro ou cet email. Vérifiez la saisie ou créez un compte.");
      return;
    }

    // Secure password verification
    const expectedPass = matched.motDePasse || 'agent123';
    if (cleanInputPass !== expectedPass) {
      setErrorField('password');
      setErrorMsg("Mot de passe incorrect. Vérifiez votre mot de passe ou cliquez sur 'Mot de passe oublié ?'.");
      return;
    }

    // Success login
    setErrorField(null);
    setSuccessMsg(`Connexion réussie ! Bienvenue ${matched.nom}`);
    setTimeout(() => {
      onLogin(matched);
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessagesAndErrors();

    if (!regNom.trim()) {
      setErrorField('regNom');
      setErrorMsg('Veuillez renseigner votre Nom et Prénom complet.');
      return;
    }

    if (!regPhone.trim()) {
      setErrorField('regPhone');
      setErrorMsg('Veuillez renseigner votre numéro de téléphone mobile.');
      return;
    }

    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setErrorField('regPassword');
      setErrorMsg('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    // Check if phone already registered
    const cleanPhoneInput = regPhone.trim().replace(/[\s+]/g, '');
    const phoneExists = availableAgents.some((a) => (a.telephone || '').replace(/[\s+]/g, '') === cleanPhoneInput);
    if (phoneExists) {
      setErrorField('regPhone');
      setErrorMsg('Ce numéro de téléphone est déjà associé à un compte agent. Veuillez vous connecter.');
      return;
    }

    setIsSubmitting(true);
    setErrorField(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const newAgent: User = {
        id: `usr-${Date.now()}`,
        nom: regNom.trim(),
        email: regEmail.trim() || `${regNom.toLowerCase().replace(/\s+/g, '.')}@klinatop.bj`,
        telephone: regPhone.trim(),
        role: 'agent',
        poste: "Agent d'entretien",
        equipeId: regEquipe.includes('Alpha') ? 'eq-1' : regEquipe.includes('BêtA') ? 'eq-2' : 'eq-3',
        equipeNom: regEquipe,
        statut: 'Actif',
        initiales: regNom.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AG',
        photoUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200',
        motDePasse: regPassword.trim(),
      };

      setSuccessMsg('Compte agent créé avec succès ! Ouverture de votre espace...');
      if (onRegisterAgent) {
        onRegisterAgent(newAgent);
      }
      setTimeout(() => {
        onLogin(newAgent);
      }, 700);
    }, 600);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMessagesAndErrors();
    const clean = forgotQuery.trim().toLowerCase().replace(/[\s+]/g, '');

    if (!clean) {
      setErrorField('forgotQuery');
      setErrorMsg('Veuillez renseigner votre numéro de téléphone ou email.');
      return;
    }

    const matched = availableAgents.find((a) => {
      const cleanPhone = (a.telephone || '').toLowerCase().replace(/[\s+]/g, '');
      const cleanEmail = (a.email || '').toLowerCase().trim();
      return cleanPhone === clean || cleanPhone.endsWith(clean) || cleanEmail === forgotQuery.trim().toLowerCase();
    });

    if (!matched) {
      setErrorField('forgotQuery');
      setErrorMsg('Aucun compte agent correspondant trouvé dans la base.');
      return;
    }

    setForgotHelpContact(matched.nom);
    setForgotSuccess(true);
    setSuccessMsg(`Demande enregistrée pour ${matched.nom}. Contactez votre Superviseur RH pour le code de réinitialisation temporaire.`);
  };

  return (
    <div className="flex flex-col min-h-[640px] justify-between p-5 bg-[#F5F7FA] font-poppins animate-fadeIn">
      {/* Logo Header avec badge "ESPACE AGENT DE TERRAIN" sans icône à gauche */}
      <div className="flex flex-col items-center pt-2 text-center">
        <KlinaTopLogo variant="compact" size="md" lightBackground={true} />
        <div className="mt-2.5 px-3.5 py-1 bg-emerald-100/90 rounded-full border border-emerald-300/80">
          <span className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">Espace Agent de Terrain</span>
        </div>
      </div>

      {/* Switcher Mode: Connexion vs Inscription */}
      {mode !== 'forgot_password' ? (
        <div className="flex rounded-xl bg-gray-200/90 p-1 my-3 border border-gray-300">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              resetMessagesAndErrors();
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
              resetMessagesAndErrors();
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'register' ? 'bg-[#0F9D58] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Créer un compte
          </button>
        </div>
      ) : (
        <div className="my-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              resetMessagesAndErrors();
              setForgotSuccess(false);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour à la connexion</span>
          </button>
        </div>
      )}

      {/* Message d'erreur haut de page */}
      {errorMsg && (
        <div className="p-3 my-1.5 bg-rose-50 border-2 border-rose-400/80 rounded-xl text-rose-800 text-xs font-medium flex items-start gap-2 animate-fadeIn shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {/* Message de succès haut de page */}
      {successMsg && (
        <div className="p-3 my-1.5 bg-emerald-50 border-2 border-emerald-400 rounded-xl text-emerald-900 text-xs font-medium flex items-center justify-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#0F9D58] shrink-0" />
          <span className="leading-snug">{successMsg}</span>
        </div>
      )}

      {mode === 'login' && (
        /* FORMULAIRE DE CONNEXION AGENT */
        <form onSubmit={handleLoginSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-3.5 my-auto">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Numéro de téléphone ou Email Agent</label>
            <div className="relative">
              <Phone className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${errorField === 'identifier' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorField === 'identifier') setErrorField(null);
                }}
                placeholder="ex. +229 97 00 00 00 ou email"
                autoComplete="username"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'identifier'
                    ? 'bg-rose-50/50 border-2 border-rose-500 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#0F9D58] focus:bg-white focus:ring-2 focus:ring-[#0F9D58]/20'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">Mot de passe ou Code secret</label>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setForgotQuery(identifier);
                  resetMessagesAndErrors();
                }}
                className="text-[11px] font-semibold text-[#0F9D58] hover:text-[#0c8047] hover:underline cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${errorField === 'password' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorField === 'password') setErrorField(null);
                }}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'password'
                    ? 'bg-rose-50/50 border-2 border-rose-500 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#0F9D58] focus:bg-white focus:ring-2 focus:ring-[#0F9D58]/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#0F9D58] cursor-pointer accent-[#0F9D58]"
              />
              <span className="text-gray-600 font-medium text-[11px]">Se souvenir de ce téléphone</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>Accéder à mon espace de pointage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {mode === 'register' && (
        /* FORMULAIRE D'INSCRIPTION AGENT */
        <form onSubmit={handleRegisterSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-3 my-auto">
          <div className="text-center pb-1 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-800">Inscription Nouveau Agent d'Entretien</p>
            <p className="text-[10px] text-gray-500">Créez votre identifiant personnel pour vos pointages</p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Nom & Prénom Agent *</label>
            <div className="relative">
              <UserIcon className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${errorField === 'regNom' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type="text"
                required
                value={regNom}
                onChange={(e) => {
                  setRegNom(e.target.value);
                  if (errorField === 'regNom') setErrorField(null);
                }}
                placeholder="ex: DUPONT Jean"
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'regNom'
                    ? 'bg-rose-50/50 border-2 border-rose-500 text-rose-900'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#0F9D58]'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Numéro de Téléphone Mobile *</label>
            <div className="relative">
              <Phone className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${errorField === 'regPhone' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => {
                  setRegPhone(e.target.value);
                  if (errorField === 'regPhone') setErrorField(null);
                }}
                placeholder="ex: +229 97 00 00 00"
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'regPhone'
                    ? 'bg-rose-50/50 border-2 border-rose-500 text-rose-900'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#0F9D58]'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Email professionnel (Optionnel)</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="ex: jean.dupont@klinatop.bj"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#0F9D58] outline-none text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Créer un Mot de passe Agent *</label>
            <div className="relative">
              <Lock className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${errorField === 'regPassword' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  if (errorField === 'regPassword') setErrorField(null);
                }}
                placeholder="Au moins 4 caractères"
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'regPassword'
                    ? 'bg-rose-50/50 border-2 border-rose-500 text-rose-900'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#0F9D58]'
                }`}
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
            className="w-full py-2.5 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
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

      {mode === 'forgot_password' && (
        /* FORMULAIRE MOT DE PASSE OUBLIÉ */
        <form onSubmit={handleForgotPasswordSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-3.5 my-auto">
          <div className="text-center pb-2 border-b border-gray-100">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0F9D58] mb-1.5">
              <KeyRound className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-900">Récupération de compte Agent</p>
            <p className="text-[11px] text-gray-500">Renseignez votre numéro de téléphone pour retrouver votre accès</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Votre Numéro de Téléphone ou Email</label>
            <div className="relative">
              <Phone className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${errorField === 'forgotQuery' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type="text"
                required
                value={forgotQuery}
                onChange={(e) => {
                  setForgotQuery(e.target.value);
                  if (errorField === 'forgotQuery') setErrorField(null);
                }}
                placeholder="ex. +229 97 00 00 00"
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'forgotQuery'
                    ? 'bg-rose-50/50 border-2 border-rose-500 text-rose-900 focus:ring-2 focus:ring-rose-400/30'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-[#0F9D58] focus:bg-white'
                }`}
              />
            </div>
          </div>

          {forgotSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <p className="text-xs font-bold text-emerald-900">Demande transmise au Superviseur RH</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Votre superviseur RH a été notifié pour réinitialiser le mot de passe de <strong>{forgotHelpContact}</strong>.
              </p>
              <p className="text-[10px] text-gray-600 bg-white p-2 rounded-lg border border-emerald-100">
                💡 Mot de passe temporaire par défaut configuré : <code className="font-bold text-[#0F9D58]">agent123</code>
              </p>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <span>Vérifier mon identifiant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="pt-2 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                resetMessagesAndErrors();
              }}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 hover:underline cursor-pointer"
            >
              Revenir à la page de connexion
            </button>
          </div>
        </form>
      )}

      {/* Footer Support */}
      <div className="text-center pt-3 pb-1 border-t border-gray-200/60">
        <p className="text-[11px] text-gray-500 font-medium">
          Assistance technique KlinaTop RH :{' '}
          <a href="tel:+22901970000" className="text-[#0F9D58] font-bold hover:underline">
            +229 01 97 00 00
          </a>
        </p>
      </div>
    </div>
  );
};