import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  User,
  UserPlus,
  Briefcase,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  MailCheck,
  Send,
  RefreshCw,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { KlinaTopLogo } from '../common/KlinaTopLogo';
import { RhAdminUser } from '../../types';
import { initialAdmins, registerAdminInFirestore, authenticateAdminInFirestore } from '../../lib/firestoreService';
import { auth } from '../../lib/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';

interface RhLoginViewProps {
  onLoginSuccess: (admin: RhAdminUser) => void;
  availableAdmins?: RhAdminUser[];
}

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
  
  // États connexion
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // États inscription
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPoste, setRegisterPoste] = useState('Responsable des Ressources Humaines');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [directorCode, setDirectorCode] = useState('');

  // États vérification email
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [serverGeneratedCode, setServerGeneratedCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Envoi réel du code de vérification par email
  const sendRealEmailCode = async (targetEmail: string, recipientName: string, passWordText: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setServerGeneratedCode(code);
    setResendCountdown(60);

    // 1. Firebase Auth
    try {
      if (auth && passWordText) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, targetEmail, passWordText);
          if (userCred.user) {
            await sendEmailVerification(userCred.user);
          }
        } catch (authErr: any) {
          if (authErr.code === 'auth/email-already-in-use') {
            try {
              const userCred = await signInWithEmailAndPassword(auth, targetEmail, passWordText);
              if (userCred.user) {
                await sendEmailVerification(userCred.user);
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      }
    } catch (firebaseErr) {
      console.warn('[Firebase Auth] Note:', firebaseErr);
    }

    // 2. Appel backend Gmail SMTP
    try {
      const response = await fetch('/api/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          code: code,
          recipientName: recipientName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Impossible d'expédier l'email.");
      }

      return code;
    } catch (err: any) {
      console.error('API send-verification-email error:', err);
      throw err;
    }
  };

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

    const allKnownAdmins = [...availableAdmins, ...initialAdmins];
    let targetAdmin: RhAdminUser | undefined = allKnownAdmins.find(
      (a) => a.email && a.email.toLowerCase() === cleanEmail
    );

    if (!targetAdmin) {
      try {
        const result = await authenticateAdminInFirestore(cleanEmail, enteredPassword);
        setIsLoading(false);

        if (result.success && result.admin) {
          onLoginSuccess(result.admin);
          return;
        }

        setErrorMsg(
          result.error ||
          "Aucun compte Administrateur n'est enregistré avec cette adresse email. Veuillez d'abord créer votre compte via l'onglet « Créer un compte RH » avec le Code d'Autorisation fourni par le Directeur Général."
        );
        return;
      } catch (err) {
        setIsLoading(false);
        setErrorMsg(
          "Aucun compte Administrateur n'est enregistré avec cette adresse email. Veuillez d'abord créer votre compte via l'onglet « Créer un compte RH » avec le Code d'Autorisation fourni par le Directeur Général."
        );
        return;
      }
    }

    const expectedPassword = targetAdmin.motDePasse || 'admin123';
    if (enteredPassword !== expectedPassword) {
      setIsLoading(false);
      setErrorMsg("Mot de passe incorrect. Veuillez vérifier votre mot de passe administrateur.");
      return;
    }

    setIsLoading(false);
    onLoginSuccess(targetAdmin);
  };

  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim() || !directorCode.trim()) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires, y compris le Code d’Autorisation Directeur.');
      return;
    }

    const cleanEmail = registerEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("L'adresse email saisie est invalide. Veuillez vérifier votre adresse de messagerie.");
      return;
    }

    const allKnown = [...availableAdmins, ...initialAdmins];
    const existing = allKnown.find((a) => a.email && a.email.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMsg('Un compte Administrateur existe déjà avec cette adresse email. Veuillez vous connecter.');
      return;
    }

    const cleanCode = directorCode.trim().toUpperCase();
    if (!VALID_DIRECTOR_CODES.includes(cleanCode)) {
      setErrorMsg('Code d’autorisation Directeur invalide. Veuillez demander le code d’accès au Directeur Général.');
      return;
    }

    setIsLoading(true);

    try {
      await sendRealEmailCode(cleanEmail, registerName.trim(), registerPassword.trim());
      setIsLoading(false);
      setIsVerifyingEmail(true);
      setVerificationCode('');
      setSuccessMsg(`Un code de sécurité à 6 chiffres a été expédié par email à ${cleanEmail}.`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Échec de l'envoi de l'email de vérification.");
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    const cleanEmail = registerEmail.trim().toLowerCase();
    setIsLoading(true);
    setErrorMsg('');
    try {
      await sendRealEmailCode(cleanEmail, registerName.trim(), registerPassword.trim());
      setIsLoading(false);
      setSuccessMsg(`Un nouveau code de sécurité à 6 chiffres a été expédié à ${cleanEmail}.`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Erreur lors du renvoi du code par email.");
    }
  };

  const handleConfirmVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanInputCode = verificationCode.trim().replace(/\s/g, '');

    if (!cleanInputCode) {
      setErrorMsg('Veuillez saisir le code de sécurité à 6 chiffres reçu dans votre boîte email.');
      return;
    }

    if (cleanInputCode !== serverGeneratedCode) {
      setErrorMsg('Code de confirmation incorrect. Veuillez saisir exactement le code reçu par email.');
      return;
    }

    setIsLoading(true);

    const cleanEmail = registerEmail.trim().toLowerCase();
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
      emailVerified: true
    };

    try {
      await registerAdminInFirestore(newAdmin);
    } catch (err) {
      console.warn('Could not save admin in Firestore, fallback to local session', err);
    }

    setIsLoading(false);
    setSuccessMsg(`Adresse email certifiée avec succès ! Compte Administrateur activé.`);
    setTimeout(() => {
      onLoginSuccess(newAdmin);
    }, 800);
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
        {!isVerifyingEmail && (
          <div className="flex rounded-xl bg-gray-900 p-1 border border-gray-700">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setSuccessMsg('');
                setIsVerifyingEmail(false);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                setSuccessMsg('');
                setIsVerifyingEmail(false);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-[#0F9D58] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer un compte RH</span>
            </button>
          </div>
        )}

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/80 border border-red-500 rounded-xl text-red-200 text-xs font-medium flex items-start gap-2.5 shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Message de succès */}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VUE 1 : CONNEXION */}
        {authMode === 'login' && (
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
        )}

        {/* VUE 2 : CRÉATION DE COMPTE (ÉTAPE 1 - SAISIE) */}
        {authMode === 'register' && !isVerifyingEmail && (
          <form onSubmit={handleInitiateRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nom complet du Responsable</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] transition-all"
                  placeholder="ex: Koffi Fadou Léon"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Poste dans l'entreprise</label>
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
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Adresse Email Professionnelle <span className="text-emerald-400 font-normal">(vérification par mail)</span>
              </label>
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
              <p className="text-[10px] text-gray-400 mt-1">
                Un code de vérification à 6 chiffres vous sera envoyé par email pour certifier votre adresse.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0F9D58] transition-all"
                  placeholder="Créer un mot de passe (min 6 caractères)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                  title={showRegisterPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CODE D'AUTORISATION DIRECTEUR OBLIGATOIRE */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <span>Code d'Autorisation Directeur (Requis)</span>
              </label>
              <input
                type="text"
                value={directorCode}
                onChange={(e) => setDirectorCode(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase tracking-wider placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                placeholder="Code fourni par le Directeur (ex: KLINATOP-2026)"
                required
              />
              <p className="text-[10px] text-gray-400">
                Ce code secret est délivré par le Directeur Général pour autoriser la création de compte RH.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F9D58] hover:bg-[#0c8047] active:scale-98 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Envoi du code par email...</span>
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Continuer & Envoyer le code par email</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>
        )}

        {/* VUE 3 : ÉTAPE 2 - VÉRIFICATION DU CODE REÇU PAR EMAIL */}
        {authMode === 'register' && isVerifyingEmail && (
          <form onSubmit={handleConfirmVerification} className="space-y-4">
            <div className="p-5 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center space-y-2.5">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <MailCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Vérification de l'adresse email</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Un email contenant votre code de confirmation à 6 chiffres a été expédié à :
              </p>
              <div className="font-semibold text-xs text-emerald-300 bg-gray-900/90 py-2 px-3.5 rounded-lg inline-block border border-gray-700">
                {registerEmail}
              </div>

              {/* Bouton d'accès direct à la boîte Gmail */}
              <div className="pt-2">
                <a
                  href={`https://mail.google.com/mail/u/0/#search/from:KlinaTop+OR+KlinaTop`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all font-medium"
                >
                  <span>Ouvrir Gmail pour consulter le code</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5 text-center">
                Saisissez le code à 6 chiffres reçu dans votre boîte email
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/[^0-9]/g, ''));
                    setErrorMsg('');
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-center text-xl font-mono tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                  placeholder="------"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0F9D58] hover:bg-[#0c8047] active:scale-98 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    <span>Validation du compte en cours...</span>
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmer & Activer mon compte RH</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerifyingEmail(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier l'adresse email</span>
                </button>

                <button
                  type="button"
                  disabled={resendCountdown > 0 || isLoading}
                  onClick={handleResendCode}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 ${
                    resendCountdown > 0 || isLoading
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendCountdown > 0 ? '' : 'hover:rotate-180 transition-transform'}`} />
                  <span>
                    {resendCountdown > 0 ? `Renvoyer (${resendCountdown}s)` : 'Renvoyer un code'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};