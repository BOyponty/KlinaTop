import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Trash2,
  Check,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { RhAdminUser } from '../../types';

interface RhProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: RhAdminUser | null;
  onSaveProfile: (updatedAdmin: RhAdminUser) => Promise<void> | void;
}

export const RhProfileModal: React.FC<RhProfileModalProps> = ({
  isOpen,
  onClose,
  admin,
  onSaveProfile,
}) => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [poste, setPoste] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
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

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isOpen && admin) {
      setNom(admin.nom || '');
      setEmail(admin.email || '');
      setTelephone(admin.telephone || '');
      setPoste(admin.poste || '');
      setPhotoUrl(admin.photoUrl || null);
      setCameraError(null);
      setIsCameraActive(false);
    }
  }, [isOpen, admin]);

  // Clean up camera stream when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setCameraError(null);
    stopCamera();

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
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = mediaStream;
      setIsCameraActive(true);
      setCameraFacing(facing);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video play error:', e);
        }
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError("Impossible d'accéder à la caméra. Utilisez l'importation de fichier.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const sx = ((video.videoWidth || 480) - size) / 2;
      const sy = ((video.videoHeight || 480) - size) / 2;
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setPhotoUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const raw = event.target?.result as string;
      if (!raw) return;

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
          setPhotoUrl(canvas.toDataURL('image/jpeg', 0.88));
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    stopCamera();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) {
      alert('Le nom est obligatoire.');
      return;
    }

    setIsSaving(true);
    try {
      const parts = nom.trim().split(' ').filter(Boolean);
      const initiales =
        parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : (nom.trim().slice(0, 2) || 'RH').toUpperCase();

      const updatedAdmin: RhAdminUser = {
        ...admin!,
        nom: nom.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        poste: poste.trim() || 'Responsable RH',
        photoUrl: photoUrl || undefined,
        initiales,
      };

      await onSaveProfile(updatedAdmin);
      setToastMsg('Profil et photo enregistrés avec succès !');
      setTimeout(() => {
        setToastMsg(null);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert("Une erreur est survenue lors de l'enregistrement du profil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !admin) return null;

  const initials =
    nom.trim()
      ? nom
          .trim()
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'RH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-poppins">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F9D58] flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">Mon Profil RH & Photo</h3>
              <p className="text-xs text-gray-500">Personnalisez votre photo et informations administratives</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Toast feedback */}
          {toastMsg && (
            <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Photo Section */}
          <div className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-4">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center relative">
                {photoUrl ? (
                  <img src={photoUrl} alt={nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#0F9D58] to-emerald-400 text-white flex items-center justify-center text-3xl font-extrabold shadow-inner">
                    {initials}
                  </div>
                )}

                {isCameraActive && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-2 text-center text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mb-1 text-emerald-400" />
                    <span>Caméra en direct...</span>
                  </div>
                )}
              </div>

              {photoUrl && !isCameraActive && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Supprimer la photo"
                  className="absolute top-0 right-0 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Camera View Box */}
            {isCameraActive && (
              <div className="w-full max-w-xs space-y-3 animate-fadeIn">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border-2 border-emerald-500 shadow-md">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 bg-[#0F9D58] hover:bg-[#0c8047] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Prendre la photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-3 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Photo Action Buttons */}
            {!isCameraActive && (
              <div className="flex flex-wrap items-center justify-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => startCamera('user')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Prendre un Selfie
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Importer une photo
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form id="rh-profile-form" onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: ZINSOU Chantal"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Poste / Fonction <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={poste}
                  onChange={(e) => setPoste(e.target.value)}
                  placeholder="Ex: Responsable RH Principale"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Adresse Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chantal.zinsou@klinatop.bj"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+229 97 45 12 00"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0F9D58]" />
                <span className="text-xs font-semibold text-gray-700">Rôle d'accès :</span>
              </div>
              <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {admin.role === 'superadmin' ? 'Directeur Général (SuperAdmin)' : 'Responsable RH'}
              </span>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="submit"
            form="rh-profile-form"
            disabled={isSaving}
            className="bg-[#0F9D58] hover:bg-[#0c8047] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Enregistrement...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};