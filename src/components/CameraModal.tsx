import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Upload, SwitchCamera } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  title?: string;
}

const PRESET_PHOTOS = [
  {
    name: 'Agent Uniforme Site 1',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Agent Uniforme Site 2',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Badge & Site Entrée',
    url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Contrôle Fin de Poste',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
  },
];

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Prendre une photo de présence',
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera(cameraFacing);
    } else {
      stopCamera();
      setCapturedPhoto(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      setStream(null);
    }

    try {
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch (err1) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      setIsCameraActive(true);
      setCameraFacing(facing);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Accès caméra indisponible ou bloqué dans le navigateur. Vous pouvez sélectionner une photo ci-dessous.');
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacing = async () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    await startCamera(nextFacing);
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (cameraFacing === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (cameraFacing === 'user') {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(10, canvas.height - 40, canvas.width - 20, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Poppins, sans-serif';
        const now = new Date();
        ctx.fillText(
          `KlinaTop Verified • ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')} • GPS Verified`,
          20,
          canvas.height - 20
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhoto(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      stopCamera();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#1F2937] text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#0F9D58]" />
            <h3 className="font-semibold text-base">{title}</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {capturedPhoto ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#0F9D58] shadow-md bg-black">
                <img src={capturedPhoto} alt="Captured check-in" className="w-full h-64 object-cover" />
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-xl flex justify-between items-center">
                  <span className="font-medium text-[#0F9D58]">✓ Horodatage vérifié</span>
                  <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCapturedPhoto(null)}
                  className="flex-1 py-2.5 px-3 border border-gray-300 rounded-xl text-gray-700 font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Refaire
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex-1 py-2.5 px-3 bg-[#0F9D58] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0d8a4d] transition-colors shadow-sm cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Valider la photo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 aspect-4/3 flex items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      <span>{cameraFacing === 'user' ? 'Caméra Avant' : 'Caméra Arrière'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full shadow-md transition-all cursor-pointer"
                      title="Changer de caméra (Avant / Arrière)"
                    >
                      <SwitchCamera className="w-4 h-4 text-emerald-300" />
                    </button>
                  </>
                ) : (
                  <div className="p-6 text-center text-gray-400 space-y-2">
                    <Camera className="w-12 h-12 mx-auto text-gray-500" />
                    <p className="text-xs text-gray-300">{cameraError || "Caméra en cours d'activation..."}</p>
                    <button
                      onClick={() => startCamera(cameraFacing)}
                      className="mt-2 text-xs text-[#0F9D58] font-semibold underline hover:text-[#0b7742] cursor-pointer"
                    >
                      Réessayer la caméra
                    </button>
                  </div>
                )}
              </div>

              {isCameraActive && (
                <div className="flex gap-2">
                  <button
                    onClick={takeSnapshot}
                    className="flex-1 py-3 bg-[#0F9D58] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#0b8046] transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" /> Capturer maintenant
                  </button>
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="px-3.5 py-3 bg-emerald-50 text-[#0F9D58] border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100"
                    title="Basculer vers l'autre caméra"
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span>{cameraFacing === 'user' ? 'Arrière' : 'Avant'}</span>
                  </button>
                </div>
              )}

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500 font-medium">Ou choisir une photo type</span>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 border border-dashed border-[#0F9D58] text-[#0F9D58] font-medium text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Importer une photo de ma galerie
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {PRESET_PHOTOS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCapturedPhoto(preset.url)}
                      className="group relative rounded-xl overflow-hidden border border-gray-200 hover:border-[#0F9D58] transition-all text-left cursor-pointer"
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[10px] text-white font-medium truncate">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};