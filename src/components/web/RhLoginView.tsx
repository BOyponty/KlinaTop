import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2, User, UserPlus, Key, Briefcase, KeyRound, AlertCircle } from 'lucide-react';
import { KlinaTopLogo } from '../common/KlinaTopLogo';
import { RhAdminUser } from '../../types';
import { initialAdmins, registerAdminInFirestore, authenticateAdminInFirestore } from '../../lib/firestoreService';

interface RhLoginViewProps {
  onLoginSuccess: (admin: RhAdminUser) => void;
  availableAdmins?: RhAdminUser[];
}

// Codes d'autorisation délivrés par le Directeur Général
const VALID_DIRECTOR_CODES = [
  'KLINATOP-2026',
  'KLINATOP2026',
  'KT-DIR-2026',
  'DIR-2026',
  'KT2026',
  '2026'
];

export const RhLoginView: React.FC<RhLoginViewProps> = ({ onLoginSuccess, availableAdmins = initialAdmins }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPoste, setRegisterPoste] = useState('Responsable des Ressources Humaines');
  const [registerPassword, setRegisterPassword] = useState('');
  const [directorCode, setDirectorCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    if (!cleanEmail || !enteredPassword) {
      setErrorMsg('Veuillez renseigner votre email et votre mot de passe administrateur.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Vérification dans la liste locale chargée
      let targetAdmin: RhAdminUser | undefined = availableAdmins.find(
        (a) => a.email.toLowerCase() === cleanEmail
      );

      // 2. Si pas trouvé en mémoire, vérification directe dans Firestore
      if (!targetAdmin) {
        const result = await authenticateAdminInFirestore(cleanEmail, enteredPassword);
        setIsLoading(false);

        if (!result.success || !result.admin) {
          setErrorMsg(result.error || "Aucun compte Administrateur n'est enregistré avec cette adresse email.");
          return;
        }

        onLoginSuccess(result.admin);
        return;
      }

      // 3. Admin trouvé -> Vérification stricte du mot de passe
      const expectedPassword = targetAdmin.motDePasse || 'admin123';
      if (enteredPassword !== expectedPassword) {
        setIsLoading(false);
        setErrorMsg(`❌ Mot de passe incorrect pour « ${targetAdmin.nom} » (${cleanEmail}). Accès refusé.`);
        return;
      }

      // 4. Mot de passe valide
      setIsLoading(false);
      onLoginSuccess(targetAdmin);
    } catch (err) {
      setIsLoading(false);
      console.error('Login error:', err);
      setErrorMsg('Erreur de connexion. Veuillez vérifier vos identifiants.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim() || !directorCode.trim()) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires, y compris le Code d’Autorisation Directeur.');
      return;
    }

    const cleanEmail = registerEmail.trim().toLowerCase();

    // Vérifier si l'email existe déjà
    const existing = availableAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMsg('Un compte Administrateur existe déjà avec cette adresse email. Veuillez vous connecter.');
      return;
    }

    // Vérification du Code Directeur
    const cleanCode = directorCode.trim().toUpperCase();
    if (!VALID_DIRECTOR_CODES.includes(cleanCode)) {
      setErrorMsg('Code d’autorisation Directeur invalide. Veuillez demander le code au Directeur Général.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const isDirectorRole = registerPoste.includes('Directeur');
    const newAdmin: RhAdminUser = {
      id: `adm-${Date.now()}`,
      nom: registerName.trim(),
      email: cleanEmail,
      role: isDirectorRole ? 'superadmin' : 'rh',
      poste: registerPoste,
      initiales: registerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      motDePasse: registerPassword.trim(),
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
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 font-poppins">
      <div className="w-full max-w-md bg-[#1F2937] text-white rounded-2xl shadow-2xl border border-gray-700/80 p-6 sm:p-8 space-y-6">
        {/* En-tête officiel */}
        <div className="text-center space-y-2">
          <KlinaTopLogo variant="full" size="md" lightBackground={false} />
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">Espace Administration & RH</h2>
          <p className="text-xs text-gray-400">
            Portail de gestion d'entreprise & suivi des équipes <span className="text-emerald-400 font-semibold">KlinaTop</span>
          </p>
        </div>

        {/* Onglets Connexion / Inscription */}
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

        {/* Message d'erreur visible en ROUGE */}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/80 border-2 border-red-500 rounded-xl text-red-200 text-xs font-semibold flex items-center gap-2 shadow-lg animate-in fade-in zoom-in-95">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Adresse Email Administrateur / RH</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] transition-all"
                  placeholder="ex: leonkoffifadou2000@gmail.com"
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F9D58] hover:bg-[#0c8047] active:scale-98 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Vérification...</span>
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
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nom complet du Responsable</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] transition-all"
                  placeholder="ex: Koffi Fadou"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Poste</label>
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
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] transition-all"
                  placeholder="ex: direction@klinatop.bj"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] transition-all"
                  placeholder="Créer un mot de passe"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Code d'Autorisation Directeur</span>
              </label>
              <input
                type="text"
                value={directorCode}
                onChange={(e) => setDirectorCode(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase tracking-wider placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-all"
                placeholder="Code Directeur (ex: KLINATOP-2026)"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
            >
              {isLoading ? (
                <span>Création...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Créer le Compte RH</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};