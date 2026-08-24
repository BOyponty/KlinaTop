import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  Users,
  Clock,
  ShieldCheck,
  LogOut,
  Camera,
  Upload,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  SwitchCamera
} from 'lucide-react';
import { User } from '../../types';

interface MobileProfileProps {
  agent: User;
  onLogout: () => void;
  onUpdatePhoto?: (newPhotoUrl: string) => Promise<void> | void;
}

export const MobileProfile: React.FC<MobileProfileProps> = ({ agent, onLogout, onUpdatePhoto }) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoSourceMode, setPhotoSourceMode] = useState<'camera' | 'upload' | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Arrêt propre du flux vidéo caméra
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const openCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setCameraError(null);
    setTempPhoto(null);
    setPhotoSourceMode('camera');
    setIsPhotoModalOpen(true);

    stopCameraStream();

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });
      } catch (err1) {
        // Secours si contrainte stricte non supportée
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraFacing(facing);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      setCameraError('Accès caméra indisponible ou bloqué. Vous pouvez importer une photo depuis votre galerie.');
    }
  };

  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    await openCamera(nextFacing);
  };

  const captureCameraSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const vWidth = video.videoWidth || 480;
      const vHeight = video.videoHeight || 480;
      const size = Math.min(vWidth, vHeight);
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Effet miroir uniquement sur caméra avant (Selfie)
        if (cameraFacing === 'user') {
          ctx.translate(400, 0);
          ctx.scale(-1, 1);
        }

        // Recadrage carré centré
        const startX = (vWidth - size) / 2;
        const startY = (vHeight - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setTempPhoto(dataUrl);
        stopCameraStream();
      }
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const minDim = Math.min(img.width, img.height);
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 400, 400);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setTempPhoto(compressed);
          setPhotoSourceMode('upload');
          setIsPhotoModalOpen(true);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSavePhoto = async () => {
    if (!tempPhoto) return;
    setIsSaving(true);
    try {
      if (onUpdatePhoto) {
        await onUpdatePhoto(tempPhoto);
      }
      setToastMessage('Photo de profil mise à jour avec succès !');
      setTimeout(() => setToastMessage(null), 3500);
      handleCloseModal();
    } catch (err) {
      console.error('Error saving profile photo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    stopCameraStream();
    setIsPhotoModalOpen(false);
    setPhotoSourceMode(null);
    setTempPhoto(null);
    setCameraError(null);
  };

  return (
    <div className="p-4 space-y-4 font-poppins animate-fadeIn pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Header Box */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex flex-col items-center text-center space-y-3 relative overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0F9D58] via-emerald-400 to-[#0F9D58]" />

        {/* Photo de profil de l'agent */}
        <div className="relative group mt-1">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#0F9D58] shadow-md bg-gray-100 flex items-center justify-center">
            {agent.photoUrl ? (
              <img
                src={agent.photoUrl}
                alt={agent.nom}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-emerald-700 text-white flex items-center justify-center text-2xl font-black">
                {agent.initiales || agent.nom.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Bouton rapide caméra sur l'avatar */}
          <button
            type="button"
            onClick={() => openCamera('user')}
            title="Prendre une photo réelle"
            className="absolute bottom-0 right-0 p-2 bg-[#0F9D58] hover:bg-[#0c8047] text-white rounded-full shadow-lg border-2 border-white transition-transform active:scale-90 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-extrabold text-lg text-gray-900 leading-tight">{agent.nom}</h3>
          <p className="text-xs font-bold text-[#0F9D58] mt-0.5">{agent.poste}</p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-[#0F9D58] px-3 py-1 rounded-full text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Identité Vérifiée
          </span>
        </div>

        {/* Boutons d'action */}
        <div className="w-full pt-2 flex gap-2">
          <button
            type="button"
            onClick={() => openCamera('user')}
            className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#0F9D58] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Prendre Photo</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            <span>Importer Photo</span>
          </button>

          {/* Native File Input caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelection}
          />
        </div>
      </div>

      {/* Informations de l'agent */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3.5 text-xs">
        <div className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">
          Informations de l'agent
        </div>

        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <span className="text-gray-500 font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" /> Équipe & Site
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
          <span className="font-bold text-[#0F9D58] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            {agent.statut}
          </span>
        </div>
      </div>

      {/* Déconnexion */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-600 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 border border-gray-200 shadow-2xs cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Se déconnecter de ce téléphone
      </button>

      {/* MODAL: Capture Caméra (Avant / Arrière) & Validation */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0F9D58]" />
                <h4 className="font-bold text-xs">Photo de profil de l'agent</h4>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-full text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex flex-col items-center space-y-3">
              {tempPhoto ? (
                /* Aperçu Photo capturée */
                <div className="flex flex-col items-center space-y-3 w-full">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-[#0F9D58] shadow-md bg-black">
                    <img
                      src={tempPhoto}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 text-center">
                    Confirmez-vous cette photo de profil pour votre compte ?
                  </p>

                  <div className="flex gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTempPhoto(null);
                        if (photoSourceMode === 'camera') {
                          openCamera(cameraFacing);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reprendre</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePhoto}
                      disabled={isSaving}
                      className="flex-1 py-2.5 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? (
                        <span>Enregistrement...</span>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Valider la photo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Vue Caméra en Direct (Avant ou Arrière) */
                <div className="flex flex-col items-center space-y-3 w-full">
                  {cameraError ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2.5 w-full">
                      <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                      <p className="text-xs text-rose-700 font-medium">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 bg-[#0F9D58] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Importer une photo depuis vos fichiers
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-[#0F9D58] bg-black shadow-inner flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                      />
                      {/* Guide circulaire */}
                      <div className="absolute inset-0 border-2 border-dashed border-white/60 rounded-full pointer-events-none" />

                      {/* Badge Mode Caméra */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {cameraFacing === 'user' ? 'Caméra Avant' : 'Caméra Arrière'}
                      </div>

                      {/* Bouton de basculement Caméra sur la vidéo */}
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="absolute bottom-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full shadow-lg transition-all cursor-pointer z-10"
                        title="Basculer de caméra (Avant / Arrière)"
                      >
                        <SwitchCamera className="w-4 h-4 text-emerald-300" />
                      </button>
                    </div>
                  )}

                  {!cameraError && (
                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={captureCameraSnapshot}
                        className="flex-1 py-3 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Prendre la photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="px-3.5 py-3 bg-emerald-50 hover:bg-emerald-100 text-[#0F9D58] border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Changer de caméra"
                      >
                        <SwitchCamera className="w-4 h-4" />
                        <span>{cameraFacing === 'user' ? 'Arrière' : 'Avant'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};