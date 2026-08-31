import React, { useState, useRef, useEffect } from 'react';
import { Lock, User as UserIcon, Eye, EyeOff, ArrowRight, Phone, Mail, UserPlus, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, Camera, Upload, RefreshCw, X, SwitchCamera } from 'lucide-react';
import { User, RhAdminUser } from '../../types';
import { checkEmailConflict, initialAdmins } from '../../lib/firestoreService';
import logoImg from '../../assets/images/klinatop_logo_1786547596570.jpg';

interface MobileLoginProps {
  onLogin: (agent: User) => void;
  onRegisterAgent?: (newUser: User) => void;
  availableAgents: User[];
  availableAdmins?: RhAdminUser[];
  onSwitchToRhPortal?: () => void;
}

export const MobileLogin: React.FC<MobileLoginProps> = ({
  onLogin,
  onRegisterAgent,
  availableAgents,
  availableAdmins = initialAdmins,
  onSwitchToRhPortal,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Field error flags for visual red border highlighting
  const [errorField, setErrorField] = useState<'identifier' | 'password' | 'regNom' | 'regPhone' | 'regEmail' | 'regPassword' | 'forgotQuery' | null>(null);

  // Register state for Cleaning Agent (Agent d'entretien)
  const [regNom, setRegNom] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEquipe, setRegEquipe] = useState('Équipe Alpha (Cotonou)');
  const [regPhoto, setRegPhoto] = useState<string | null>(null);

  // Camera state & controls (front user vs back environment)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
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
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const startRegCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setErrorMsg('');
    setCameraError(null);

    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }

    try {
      // First try with explicit ideal constraints
      let s: MediaStream;
      try {
        s = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });
      } catch (err1) {
        // Fallback: try generic video constraint if exact facingMode failed
        s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = s;
      setIsCameraActive(true);
      setCameraFacing(facing);

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video auto-play issue:', e);
        }
      }
    } catch (err: any) {
      console.warn('Registration camera error:', err);
      setCameraError("Impossible d'accéder à la caméra. Vous pouvez importer une photo depuis votre galerie.");
      setIsCameraActive(false);
    }
  };

  // Toggle between front and rear camera
  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    await startRegCamera(nextFacing);
  };

  // Stop camera on component unmount or mode switch
  useEffect(() => {
    return () => {
      stopRegCamera();
    };
  }, []);

  const snapRegPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const vWidth = video.videoWidth || 400;
      const vHeight = video.videoHeight || 400;
      const size = Math.min(vWidth, vHeight);
      
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // If front camera, mirror image for natural selfie result
        if (cameraFacing === 'user') {
          ctx.translate(400, 0);
          ctx.scale(-1, 1);
        }
        
        const sx = (vWidth - size) / 2;
        const sy = (vHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
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
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);
          setRegPhoto(canvas.toDataURL('image/jpeg', 0.88));
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

    // Vérifier d'abord si l'utilisateur essaie de se connecter avec un compte Administrateur RH
    const allAdmins = [...availableAdmins, ...initialAdmins];
    const matchedAdmin = allAdmins.find((a) => {
      const matchEmail = (a.email || '').toLowerCase() === cleanInput;
      const matchPhone = (a.telephone || '').replace(/\s+/g, '').includes(cleanInput.replace(/\s+/g, ''));
      return matchEmail || matchPhone;
    });

    if (matchedAdmin) {
      setErrorField('identifier');
      setErrorMsg(`⚠️ L'identifiant « ${identifier.trim()} » correspond à un compte Administrateur RH (KlinaTop). Veuillez vous connecter depuis l'Espace RH.`);
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
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorField(null);
    setSuccessMsg('');

    const cleanNom = regNom.trim();
    const cleanPhone = regPhone.trim();
    const cleanPass = regPassword.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const finalEmail = cleanEmail || `${cleanNom.toLowerCase().replace(/\s+/g, '.')}@klinatop.bj`;

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

    // 1. Check if email belongs to an Admin (RH)
    const allAdmins = [...availableAdmins, ...initialAdmins];
    const isAdminEmail = allAdmins.some((a) => (a.email || '').toLowerCase() === finalEmail);
    if (isAdminEmail) {
      setErrorField('regEmail');
      setErrorMsg("Cette adresse email est réservée à un compte Administrateur RH (KlinaTop). Un agent de terrain ne peut jamais créer un compte avec l'adresse d'un administrateur.");
      return;
    }

    // 2. Check if phone is already registered for an agent
    const isPhoneTaken = availableAgents.some((a) => (a.telephone || '').replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, ''));
    if (isPhoneTaken) {
      setErrorField('regPhone');
      setErrorMsg("Un compte agent existe déjà avec ce numéro de téléphone. Veuillez vous connecter.");
      return;
    }

    // 3. Check if email is already taken by another agent
    const isAgentEmailTaken = availableAgents.some((a) => (a.email || '').toLowerCase() === finalEmail);
    if (isAgentEmailTaken) {
      setErrorField('regEmail');
      setErrorMsg("Un agent de terrain est déjà enregistré avec cette adresse email.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 4. Remote Firestore conflict check
      const conflict = await checkEmailConflict(finalEmail, 'agent');
      if (!conflict.allowed) {
        setIsSubmitting(false);
        setErrorField('regEmail');
        setErrorMsg(conflict.reason || "Conflit d'adresse email.");
        return;
      }
    } catch (err: any) {
      console.warn('Conflict check warning:', err);
    }

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
      email: finalEmail,
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
        <div className="mb-2.5 p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 text-rose-700 text-xs animate-shake">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <p className="font-medium leading-relaxed">{errorMsg}</p>
          </div>
          {onSwitchToRhPortal && errorMsg.includes('Administrateur RH') && (
            <button
              type="button"
              onClick={onSwitchToRhPortal}
              className="w-full py-2 bg-[#1F2937] hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Basculer vers l'Espace RH Administrateur</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {successMsg && (
        <div className="mb-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F9D58]" />
          <p className="font-semibold">{successMsg}</p>
        </div>
      )}

      {/* 3. MODE 1: LOGIN FORM */}
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

      {/* 4. MODE 2: REGISTER FORM WITH DUAL CAMERA (Front / Back) & Upload */}
      {mode === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3.5 my-auto max-h-[70vh] overflow-y-auto">
          <div className="text-center pb-1">
            <p className="text-xs font-bold text-gray-900">Inscription Nouveau Agent d'Entretien</p>
            <p className="text-[10px] text-gray-500">Ajoutez votre vraie photo de profil pour la transparence</p>
          </div>

          {/* Photo Avatar with Dual Camera (Front / Rear) and Upload */}
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
                  title="Supprimer la photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Error notice if camera is blocked */}
            {cameraError && (
              <p className="text-[10px] text-amber-600 text-center px-2">{cameraError}</p>
            )}

            {isCameraActive ? (
              <div className="flex flex-col items-center space-y-2 w-full">
                <div className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-[#0F9D58] bg-black shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  {/* Badge Mode Caméra */}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {cameraFacing === 'user' ? 'Caméra Avant (Selfie)' : 'Caméra Arrière'}
                  </div>

                  {/* Switch Front / Back Camera Button */}
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full shadow-xs transition-all cursor-pointer"
                    title="Basculer vers l'autre caméra (Devant / Derrière)"
                  >
                    <SwitchCamera className="w-4 h-4 text-emerald-300" />
                  </button>
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={snapRegPhoto}
                    className="flex-1 py-2 bg-[#0F9D58] hover:bg-[#0c8047] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                  >
                    <Camera className="w-3.5 h-3.5" /> Prendre la photo
                  </button>
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="px-3 py-2 bg-emerald-50 text-[#0F9D58] border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Changer de caméra"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" /> {cameraFacing === 'user' ? 'Arrière' : 'Avant'}
                  </button>
                  <button
                    type="button"
                    onClick={stopRegCamera}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => startRegCamera('user')}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#0F9D58] text-[#0F9D58] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" /> Prendre Photo
                </button>
                <button
                  type="button"
                  onClick={() => regFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
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

      {/* 6. Switch to RH Portal & Footer Support */}
      <div className="pt-2 pb-1 space-y-2">
        {onSwitchToRhPortal && (
          <button
            type="button"
            onClick={onSwitchToRhPortal}
            className="w-full py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl flex items-center justify-between text-xs font-semibold text-gray-700 transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#0F9D58] flex items-center justify-center font-bold text-[10px]">
                RH
              </div>
              <div className="text-left">
                <span className="block font-bold text-gray-800 text-[11px]">Vous êtes Administrateur RH ?</span>
                <span className="block text-[10px] text-gray-500 font-normal">Accéder au Dashboard d'administration</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
          </button>
        )}

        <div className="text-center">
          <p className="text-[11px] text-gray-500 font-medium">
            Assistance technique KlinaTop RH : <strong className="text-[#0F9D58] font-bold">+229 01 97 00 00</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
