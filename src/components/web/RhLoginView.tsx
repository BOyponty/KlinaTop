import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, User, UserPlus, Key, Briefcase } from 'lucide-react';
import { KlinaTopLogo } from '../common/KlinaTopLogo';
import { RhAdminUser } from '../../types';
import { initialAdmins, registerAdminInFirestore } from '../../lib/firestoreService';

interface RhLoginViewProps {
  onLoginSuccess: (admin: RhAdminUser) => void;
  availableAdmins?: RhAdminUser[];
}

export const RhLoginView: React.FC<RhLoginViewProps> = ({ onLoginSuccess, availableAdmins = initialAdmins }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login Form States (clean by default)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPoste, setRegisterPoste] = useState('Responsable des Ressources Humaines');
  const [registerPassword, setRegisterPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Veuillez renseigner votre email et mot de passe RH.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      const matched = availableAdmins.find((a) => a.email.toLowerCase() === cleanEmail);

      if (matched) {
        onLoginSuccess(matched);
      } else {
        // Create an dynamic authenticated session for this admin
        const newAdminSession: RhAdminUser = {
          id: `adm-${Date.now()}`,
          nom: email.split('@')[0].replace('.', ' ').toUpperCase() || 'Administrateur RH',
          email: cleanEmail,
          role: 'rh',
          poste: 'Responsable RH / Manager',
          initiales: email.slice(0, 2).toUpperCase(),
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        };
        registerAdminInFirestore(newAdminSession).catch(console.error);
        onLoginSuccess(newAdminSession);
      }
    }, 600);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const newAdmin: RhAdminUser = {
      id: `adm-${Date.now()}`,
      nom: registerName.trim(),
      email: registerEmail.trim().toLowerCase(),
      role: registerPoste.includes('Directeur') ? 'superadmin' : 'rh',
      poste: registerPoste,
      initiales: registerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    };

    try {
      await registerAdminInFirestore(newAdmin);
    } catch (err) {
      console.warn('Could not save admin in Firestore, fallback to local session', err);
    }

    setIsLoading(false);
    setSuccessMsg(`Compte Administrateur (${newAdmin.nom}) créé avec succès ! Connexion...`);
    setTimeout(() => {
      onLoginSuccess(newAdmin);
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 font-poppins">
      <div className="w-full max-w-md bg-[#1F2937] text-white rounded-2xl shadow-2xl border border-gray-700/80 p-6 sm:p-8 space-y-6">
        {/* Official KlinaTop Logo Brand Header */}
        <div className="text-center space-y-2">
          <KlinaTopLogo variant="full" size="md" lightBackground={false} />
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">Espace Administration & RH</h2>
          <p className="text-xs text-gray-400">
            Portail de gestion d'entreprise & suivi des équipes <span className="text-emerald-400 font-semibold">KlinaTop</span>
          </p>
        </div>

        {/* Tab Switcher: Connexion vs Créer un compte */}
        <div className="flex rounded-xl bg-gray-900 p-1 border border-gray-700">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              authMode === 'login'
                ? 'bg-[#0F9D58] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Se connecter</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              authMode === 'register'
                ? 'bg-[#0F9D58] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Créer un compte RH</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {authMode === 'login' ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Adresse Email Administrateur / RH</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] transition-all"
                  placeholder="ex: admin@klinatop.bj ou votre email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-[#0F9D58] cursor-pointer accent-[#0F9D58]"
                />
                <span>Se souvenir de moi</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Contactez le support technique KlinaTop pour assistance.')}
                className="text-xs text-emerald-400 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F9D58] hover:bg-[#0c8047] active:scale-98 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Connexion en cours...</span>
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Se connecter au Tableau de Bord</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTER FORM (Créer un compte Administrateur) */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nom complet du Responsable</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] transition-all"
                  placeholder="ex: Koffi Fadou"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Rôle / Poste dans l'entreprise</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={registerPoste}
                  onChange={(e) => setRegisterPoste(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#0F9D58] transition-all"
                >
                  <option value="Directeur Général & Fondateur">Directeur Général & Fondateur</option>
                  <option value="Responsable des Ressources Humaines">Responsable des Ressources Humaines</option>
                  <option value="Superviseur des Opérations Terrain">Superviseur des Opérations Terrain</option>
                  <option value="Comptable & Gestionnaire de Paie">Comptable & Gestionnaire de Paie</option>
                  <option value="Chef de Secteur Cotonou">Chef de Secteur Cotonou</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Adresse Email Professionnelle</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] transition-all"
                  placeholder="ex: direction@klinatop.bj"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Mot de passe Administrateur</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] transition-all"
                  placeholder="Créer un mot de passe sécurisé"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F9D58] hover:bg-[#0c8047] active:scale-98 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Création du compte...</span>
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Créer mon Compte Administrateur</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Existing Quick Profiles Switch */}
        <div className="pt-3 border-t border-gray-800 text-center">
          <p className="text-[11px] text-gray-400 mb-2">Comptes Administrateurs enregistrés :</p>
          <div className="grid grid-cols-2 gap-2">
            {availableAdmins.slice(0, 2).map((adm) => (
              <button
                key={adm.id}
                type="button"
                onClick={() => onLoginSuccess(adm)}
                className="bg-gray-800/80 hover:bg-gray-700 text-left p-2 rounded-xl border border-gray-700 transition-all text-[11px] flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-900 shrink-0">
                  <img src={adm.photoUrl || ''} alt={adm.nom} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{adm.nom.split(' ')[0]}</p>
                  <p className="text-[9px] text-gray-400 truncate">{adm.role === 'superadmin' ? 'Directeur' : 'RH'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};