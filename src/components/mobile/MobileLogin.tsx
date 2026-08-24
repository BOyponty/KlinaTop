import React, { useState, useRef } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, ArrowRight, Phone, Mail, UserPlus, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, Camera, Upload, RefreshCw, X } from 'lucide-react';
import { User } from '../../types';
import logoImg from '../../assets/images/klinatop_logo_1786547596570.jpg';

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
  const [regPhoto, setRegPhoto] = useState<string | null>(null);

  // Quick camera for registration
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const regFileInputRef = useRef<HTMLInputElement>(null);

  // Forgot password state
  const [forgotQuery, setForgotQuery] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const stopRegCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startRegCamera = async () => {
    setErrorMsg('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = s;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.warn('Registration camera issue:', err);
      regFileInputRef.current?.click();
    }
  };

  const snapRegPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
      const canvas = document.createElement('canvas');
      canvas.width = 360;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const sx = ((video.videoWidth || 400) - size) / 2;
        const sy = ((video.videoHeight || 400) - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 360, 360);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setRegPhoto(dataUrl);
        stopRegCamera();
      }
    }
  };

  const handleRegFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const raw = event.target?.result as string;
      if (!raw) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 360;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 360, 360);
          setRegPhoto(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
  };

  // 1. Authentification stricte de l'agent
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorField(null);
    setSuccessMsg('');

    const cleanInput = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput) {
      setErrorField('identifier');
      setErrorMsg("Veuillez renseigner votre Numéro de téléphone ou Email.");
      return;
    }

    if (!cleanPass) {
      setErrorField('password');
      setErrorMsg('Veuillez entrer votre mot de passe.');
      return;
    }

    // Recherche de l'agent dans la base
    const matchedAgent = availableAgents.find((a) => {
      const matchPhone = (a.telephone || '').replace(/\s+/g, '').includes(cleanInput.replace(/\s+/g, ''));
      const matchEmail = (a.email || '').toLowerCase() === cleanInput;
      const matchNom = a.nom.toLowerCase().includes(cleanInput);
      return matchPhone || matchEmail || matchNom;
    });

    if (!matchedAgent) {
      setErrorField('identifier');
      setErrorMsg("Aucun agent trouvé avec ces coordonnées. Veuillez d'abord créer votre compte via l'onglet « Créer un compte ».");
      return;
    }

    const expectedPass = matchedAgent.motDePasse || 'agent123';
    if (cleanPass !== expectedPass) {
      setErrorField('password');
      setErrorMsg("Mot de passe incorrect. Cliquez sur « Mot de passe oublié ? » si vous l'avez égaré.");
      return;
    }

    setSuccessMsg(`Connexion réussie ! Bienvenue ${matchedAgent.nom}`);
    setTimeout(() => {
      onLogin(matchedAgent);
    }, 500);
  };

  // 2. Inscription d'un nouvel agent avec photo
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorField(null);
    setSuccessMsg('');

    const cleanNom = regNom.trim();
    const cleanPhone = regPhone.trim();
    const cleanPass = regPassword.trim();

    if (!cleanNom) {
      setErrorField('regNom');
      setErrorMsg("Veuillez saisir votre Nom & Prénom.");
      return;
    }

    if (!cleanPhone) {
      setErrorField('regPhone');
      setErrorMsg("Veuillez saisir votre Numéro de Téléphone Mobile.");
      return;
    }

    if (!cleanPass || cleanPass.length < 4) {
      setErrorField('regPassword');
      setErrorMsg("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    setIsSubmitting(true);

    const parts = cleanNom.split(' ');
    const initials = parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : cleanNom.slice(0, 2).toUpperCase();

    const newAgent: User = {
      id: `usr-${Date.now()}`,
      nom: cleanNom,
      role: 'agent',
      poste: "Agent d'Entretien",
      equipeId: 'eq-1',
      equipeNom: regEquipe,
      statut: 'Actif',
      telephone: cleanPhone,
      email: regEmail.trim() || `${cleanNom.toLowerCase().replace(/\s+/g, '.')}@klinatop.bj`,
      photoUrl: regPhoto || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      initiales: initials,
      motDePasse: cleanPass,
    };

    if (onRegisterAgent) {
      onRegisterAgent(newAgent);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(`Compte créé avec succès ! Bienvenue dans l'équipe, ${cleanNom}.`);
      setTimeout(() => {
        onLogin(newAgent);
      }, 800);
    }, 500);
  };

  // 3. Récupération mot de passe
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorField(null);

    const q = forgotQuery.trim().toLowerCase();
    if (!q) {
      setErrorField('forgotQuery');
      setErrorMsg('Veuillez entrer votre numéro de téléphone ou email.');
      return;
    }

    const matched = availableAgents.find((a) => {
      const matchPhone = (a.telephone || '').replace(/\s+/g, '').includes(q.replace(/\s+/g, ''));
      const matchEmail = (a.email || '').toLowerCase() === q;
      const matchNom = a.nom.toLowerCase().includes(q);
      return matchPhone || matchEmail || matchNom;
    });

    if (!matched) {
      setErrorField('forgotQuery');
      setErrorMsg("Aucun agent trouvé avec ces informations.");
      return;
    }

    setForgotSuccess(true);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F6F8FA] font-poppins px-4 py-3 justify-between">
      {/* 1. Header with Compact Clean Logo */}
      <div className="flex flex-col items-center pt-1 pb-2">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-xs border border-gray-100 p-1.5 flex items-center justify-center mb-2">
          <img
            src={logoImg}
            alt="KlinaTop"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="bg-[#E6F4EA] border border-[#0F9D58]/30 px-3.5 py-1 rounded-full">
          <span className="text-[11px] font-extrabold text-[#0F9D58] tracking-wider uppercase">
            ESPACE AGENT DE TERRAIN
          </span>
        </div>
      </div>

      {/* 2. Mode Navigation Tabs */}
      {mode !== 'forgot_password' && (
        <div className="bg-gray-200/70 p-1 rounded-2xl flex gap-1 mb-3">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
              stopRegCamera();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#0F9D58] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-[#0F9D58] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Créer un compte
          </button>
        </div>
      )}

      {/* Alert Messages */}
      {errorMsg && (
        <div className="mb-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <p className="font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F9D58]" />
          <p className="font-semibold">{successMsg}</p>
        </div>
      )}

      {/* 3. MODE 1: LOGIN FORM (Exact match to original screenshot) */}
      {mode === 'login' && (
        <form onSubmit={handleLoginSubmit} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4 my-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-800">Numéro de téléphone ou Email Agent</label>
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
                className={`w-full pl-10 pr-3.5 py-3 rounded-2xl text-xs font-medium outline-none transition-all ${
                  errorField === 'identifier'
                    ? 'border-2 border-rose-500 bg-rose-50/40 text-rose-900'
                    : 'border border-gray-200 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/15 bg-white'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-800">Mot de passe ou Code secret</label>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setErrorMsg('');
                  setForgotSuccess(false);
                }}
                className="text-[11px] text-[#0F9D58] font-semibold hover:underline cursor-pointer"
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
                className={`w-full pl-10 pr-10 py-3 rounded-2xl text-xs font-medium outline-none transition-all ${
                  errorField === 'password'
                    ? 'border-2 border-rose-500 bg-rose-50/40 text-rose-900'
                    : 'border border-gray-200 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/15 bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="rememberMeCheckbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#0F9D58] cursor-pointer accent-[#0F9D58]"
            />
            <label htmlFor="rememberMeCheckbox" className="text-gray-600 font-medium text-xs cursor-pointer select-none">
              Se souvenir de ce téléphone
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
          >
            <span>Accéder à mon espace de pointage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* 4. MODE 2: REGISTER FORM (with photo selector) */}
      {mode === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3.5 my-auto max-h-[70vh] overflow-y-auto">
          <div className="text-center pb-1">
            <p className="text-xs font-bold text-gray-900">Inscription Nouveau Agent d'Entretien</p>
            <p className="text-[10px] text-gray-500">Ajoutez votre vraie photo de profil pour la transparence</p>
          </div>

          {/* Photo Avatar with Camera/Upload Buttons */}
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-2">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0F9D58] bg-white shadow-xs flex items-center justify-center">
                {regPhoto ? (
                  <img src={regPhoto} alt="Aperçu" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              {regPhoto && (
                <button
                  type="button"
                  onClick={() => setRegPhoto(null)}
                  className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full shadow-xs hover:bg-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {isCameraActive ? (
              <div className="flex flex-col items-center space-y-1.5 w-full">
                <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#0F9D58] bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={snapRegPhoto}
                    className="flex-1 py-1.5 bg-[#0F9D58] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Capturer
                  </button>
                  <button
                    type="button"
                    onClick={stopRegCamera}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startRegCamera}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#0F9D58] text-[#0F9D58] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Prendre Photo
                </button>
                <button
                  type="button"
                  onClick={() => regFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-400" /> Importer
                </button>
                <input
                  ref={regFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleRegFileUpload}
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Nom & Prénom Agent *</label>
            <div className="relative">
              <UserIcon className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${errorField === 'regNom' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type="text"
                required
                value={regNom}
                onChange={(e) => {
                  setRegNom(e.target.value);
                  if (errorField === 'regNom') setErrorField(null);
                }}
                placeholder="ex: DUPONT Jean"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'regNom'
                    ? 'border-2 border-rose-500 bg-rose-50/40 text-rose-900'
                    : 'border border-gray-200 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/15'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Numéro de Téléphone Mobile *</label>
            <div className="relative">
              <Phone className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${errorField === 'regPhone' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => {
                  setRegPhone(e.target.value);
                  if (errorField === 'regPhone') setErrorField(null);
                }}
                placeholder="ex: +229 97 00 00 00"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'regPhone'
                    ? 'border-2 border-rose-500 bg-rose-50/40 text-rose-900'
                    : 'border border-gray-200 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/15'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Email professionnel (Optionnel)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="ex: jean.dupont@klinatop.bj"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/15 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Créer un Mot de passe Agent *</label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${errorField === 'regPassword' ? 'text-rose-500' : 'text-gray-400'}`} />
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => {
                  setRegPassword(e.target.value);
                  if (errorField === 'regPassword') setErrorField(null);
                }}
                placeholder="Au moins 4 caractères"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                  errorField === 'regPassword'
                    ? 'border-2 border-rose-500 bg-rose-50/40 text-rose-900'
                    : 'border border-gray-200 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/15'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Équipe / Site Affecté</label>
            <select
              value={regEquipe}
              onChange={(e) => setRegEquipe(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/15 outline-none bg-white transition-all"
            >
              <option value="Équipe Alpha (Cotonou)">Équipe Alpha (Cotonou)</option>
              <option value="Équipe Bravo (Akpakpa)">Équipe Bravo (Akpakpa)</option>
              <option value="Équipe Charlie (Calavi)">Équipe Charlie (Calavi)</option>
              <option value="Équipe Delta (Porto-Novo)">Équipe Delta (Porto-Novo)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Création en cours...' : 'Créer mon compte Agent'}</span>
          </button>
        </form>
      )}

      {/* 5. MODE 3: FORGOT PASSWORD */}
      {mode === 'forgot_password' && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4 my-auto">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setForgotSuccess(false);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-xs font-bold text-gray-800">Récupération de Compte</h3>
          </div>

          {!forgotSuccess ? (
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <p className="text-xs text-gray-600">
                Saisissez votre numéro de téléphone ou nom d'agent pour réinitialiser ou retrouver votre accès.
              </p>
              <div className="relative">
                <Phone className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${errorField === 'forgotQuery' ? 'text-rose-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  required
                  value={forgotQuery}
                  onChange={(e) => {
                    setForgotQuery(e.target.value);
                    if (errorField === 'forgotQuery') setErrorField(null);
                  }}
                  placeholder="ex: +229 97 00 00 00"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium outline-none transition-all ${
                    errorField === 'forgotQuery'
                      ? 'border-2 border-rose-500 bg-rose-50/40 text-rose-900'
                      : 'border border-gray-200 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/15'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Rechercher mon compte</span>
              </button>
            </form>
          ) : (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2 text-emerald-800">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#0F9D58]" />
                <span>Agent identifié avec succès</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Votre mot de passe par défaut pour le démarrage est : <strong className="bg-white px-2 py-0.5 rounded border border-emerald-300 text-gray-900">agent123</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotSuccess(false);
                }}
                className="w-full py-2.5 mt-2 bg-[#0F9D58] text-white font-bold rounded-xl text-xs hover:bg-[#0c8047] transition-all cursor-pointer"
              >
                Se connecter avec ce mot de passe
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. Footer Support */}
      <div className="text-center pt-2 pb-1">
        <p className="text-[11px] text-gray-500 font-medium">
          Assistance technique KlinaTop RH : <strong className="text-[#0F9D58] font-bold">+229 01 97 00 00</strong>
        </p>
      </div>
    </div>
  );
};

export default MobileLogin;
