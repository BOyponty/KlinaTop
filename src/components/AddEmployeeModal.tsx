import React, { useState, useRef } from 'react';
import { X, User, Mail, Phone, Briefcase, Users, Plus, Check, Camera, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { User as UserType, Equipe, RhAdminUser } from '../types';
import { initialAdmins, checkEmailConflict } from '../lib/firestoreService';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipes: Equipe[];
  onAddEmployee: (newEmployee: UserType) => void;
  existingUsers?: UserType[];
  existingAdmins?: RhAdminUser[];
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  equipes,
  onAddEmployee,
  existingUsers = [],
  existingAdmins = initialAdmins,
}) => {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+229 ');
  const [poste, setPoste] = useState("Agent d'entretien");
  const [equipeId, setEquipeId] = useState(equipes[0]?.id || 'eq-1');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Camera error in AddEmployeeModal:', e);
      fileInputRef.current?.click();
    }
  };

  const captureSnapshot = () => {
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
        setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const raw = event.target?.result as string;
      if (!raw) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const minDim = Math.min(img.width, img.height);
        canvas.width = 360;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 360, 360);
          setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = raw;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!nom.trim()) {
      setErrorMsg('Veuillez renseigner le nom complet.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const finalEmail = cleanEmail || `${nom.toLowerCase().replace(/\s+/g, '.')}@klinatop.bj`;

    // 1. Check if email matches an Admin
    const allAdmins = [...existingAdmins, ...initialAdmins];
    const isAdminEmail = allAdmins.some((a) => (a.email || '').toLowerCase() === finalEmail);
    if (isAdminEmail) {
      setErrorMsg("Cette adresse email est réservée à un compte Administrateur RH (Direction KlinaTop). Impossible de créer un agent avec cet email.");
      return;
    }

    // 2. Check if email matches existing agent
    const isAgentEmailTaken = existingUsers.some((u) => (u.email || '').toLowerCase() === finalEmail);
    if (isAgentEmailTaken) {
      setErrorMsg("Un employé de terrain existe déjà avec cette adresse email.");
      return;
    }

    setIsSubmitting(true);

    try {
      const conflict = await checkEmailConflict(finalEmail, 'agent');
      if (!conflict.allowed) {
        setIsSubmitting(false);
        setErrorMsg(conflict.reason || "Conflit d'adresse email.");
        return;
      }
    } catch (err) {
      console.warn('Conflict check warning in AddEmployeeModal:', err);
    }

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
      email: finalEmail,
      telephone: telephone.trim() || '+229 97 00 11 22',
      role: 'agent',
      poste,
      equipeId,
      equipeNom: selectedEquipeNom,
      statut: 'Actif',
      initiales,
      photoUrl: photoUrl || undefined,
      avatarBg: 'bg-emerald-600',
    };

    setIsSubmitting(false);
    onAddEmployee(newEmp);
    setNom('');
    setEmail('');
    setTelephone('+229 ');
    setPhotoUrl(null);
    stopCamera();
    onClose();
  };

  const setPreset = (presetNom: string, presetPoste: string) => {
    setErrorMsg(null);
    setNom(presetNom);
    setPoste(presetPoste);
    setEmail(`${presetNom.toLowerCase().replace(/[^a-z]/g, '')}@klinatop.bj`);
    setTelephone(`+229 97 ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)}`);
  };

  if (!isOpen) return null;

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
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 text-gray-400 hover:text-white rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Error message alert */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {/* Real Photo Capture/Upload section */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0F9D58] bg-white flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full shadow-xs hover:bg-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold text-gray-800">Photo de profil réelle de l'agent</p>
              <p className="text-[11px] text-gray-500">Capturez sa photo en direct ou importez son portrait</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2.5 py-1 bg-white border border-gray-300 hover:border-[#0F9D58] text-[#0F9D58] rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Caméra
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-400" /> Importer
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>

          {/* Active Camera View if open */}
          {isCameraActive && (
            <div className="p-3 bg-gray-900 rounded-xl flex flex-col items-center space-y-2 text-white">
              <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-[#0F9D58]">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="px-4 py-1.5 bg-[#0F9D58] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-4 h-4" /> Prendre la photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded-lg text-xs cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Suggestions rapide (Noms Béninois)
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPreset('HOUNGUE V. Rodrigue', "Agent d'entretien")}
                className="text-xs bg-emerald-50 text-[#0F9D58] px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                + HOUNGUE V. Rodrigue
              </button>
              <button
                type="button"
                onClick={() => setPreset('KPADONOU Syntyche', 'Agent de Propreté')}
                className="text-xs bg-emerald-50 text-[#0F9D58] px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                + KPADONOU Syntyche
              </button>
              <button
                type="button"
                onClick={() => setPreset('KPANOU Fabrice', 'Technicien Surface')}
                className="text-xs bg-emerald-50 text-[#0F9D58] px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
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
                placeholder="ex. DUPONT Jean"
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
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#0F9D58] text-white font-semibold text-sm rounded-xl hover:bg-[#0c8047] transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> Enregistrer l'employé
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
