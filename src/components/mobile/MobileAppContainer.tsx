import React, { useState, useEffect } from 'react';
import { Home, History, User as UserIcon, Wifi, Battery, Signal } from 'lucide-react';
import { User, Presence, Pointage } from '../../types';
import { MobileLogin } from './MobileLogin';
import { MobileCheckIn } from './MobileCheckIn';
import { MobileCheckOut } from './MobileCheckOut';
import { MobileHistory } from './MobileHistory';
import { MobileProfile } from './MobileProfile';

export type MobileTab = 'home' | 'history' | 'profile';

interface MobileAppContainerProps {
  currentAgent: User;
  allAgents: User[];
  presences: Presence[];
  pointages: Pointage[];
  onPerformCheckIn: (photoUrl: string, address: string) => void;
  onPerformCheckOut: (photoUrl: string) => void;
  onOpenCameraModal: () => void;
  photoCaptured: string | null;
  onInspectPhoto: (ptg: Pointage) => void;
  isCheckedIn: boolean;
  checkInTime: string;
  onRegisterNewAgent?: (newUser: User) => void;
  onSelectAgent?: (agent: User) => void;
  onUpdateAgentPhoto?: (userId: string, photoUrl: string) => Promise<void> | void;
  isNativeMobile?: boolean;
}

export const MobileAppContainer: React.FC<MobileAppContainerProps> = ({
  currentAgent,
  allAgents,
  presences,
  pointages,
  onPerformCheckIn,
  onPerformCheckOut,
  onOpenCameraModal,
  photoCaptured,
  onInspectPhoto,
  isCheckedIn,
  checkInTime,
  onRegisterNewAgent,
  onSelectAgent,
  onUpdateAgentPhoto,
  isNativeMobile = false,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedId = localStorage.getItem('klinatop_logged_agent_id');
      return !!savedId;
    } catch {
      return false;
    }
  });

  // Sync login and agent state when Firestore finishes loading
  useEffect(() => {
    try {
      const savedId = localStorage.getItem('klinatop_logged_agent_id');
      if (savedId) {
        setIsLoggedIn(true);
        if (allAgents && allAgents.length > 0) {
          const found = allAgents.find((a) => a.id === savedId);
          if (found && onSelectAgent) {
            onSelectAgent(found);
          }
        }
      }
    } catch (e) {
      console.warn('Sync session error', e);
    }
  }, [allAgents, onSelectAgent]);
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [subView, setSubView] = useState<'checkin' | 'checkout'>('checkin');

  const safeAgent: User = currentAgent || (allAgents && allAgents[0]) || {
    id: 'emp-fallback',
    nom: 'Agent Terrain',
    email: 'agent@klinatop.bj',
    telephone: '+229 97 00 00 00',
    role: 'agent',
    poste: "Agent d'entretien",
    equipeId: 'eq-1',
    equipeNom: 'Équipe A',
    statut: 'Actif',
    initiales: 'AT',
  };

  if (!isLoggedIn) {
    return (
      <div
        className={
          isNativeMobile
            ? 'w-full min-h-screen bg-[#F5F7FA] overflow-y-auto'
            : 'max-w-md mx-auto my-4 bg-[#F5F7FA] rounded-[36px] shadow-2xl border-8 border-gray-900 overflow-hidden min-h-[680px]'
        }
      >
        {/* Status Bar only shown in desktop simulator */}
        {!isNativeMobile && (
          <div className="bg-[#1F2937] text-white px-6 py-2 flex justify-between items-center text-[10px] font-semibold">
            <span>08:15</span>
            <div className="w-16 h-3.5 bg-black rounded-full mx-auto"></div>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-emerald-400" />
              <Wifi className="w-3 h-3 text-emerald-400" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}
        <MobileLogin
          onLogin={(agent) => {
            try {
              localStorage.setItem('klinatop_logged_agent_id', agent.id);
            } catch (e) {}
            if (onSelectAgent) onSelectAgent(agent);
            setIsLoggedIn(true);
          }}
          onRegisterAgent={(newUser) => {
            try {
              localStorage.setItem('klinatop_logged_agent_id', newUser.id);
            } catch (e) {}
            if (onRegisterNewAgent) onRegisterNewAgent(newUser);
            if (onSelectAgent) onSelectAgent(newUser);
            setIsLoggedIn(true);
          }}
          availableAgents={allAgents}
        />
      </div>
    );
  }

  return (
    <div
      className={
        isNativeMobile
          ? 'w-full min-h-screen bg-[#F5F7FA] relative flex flex-col font-poppins'
          : 'max-w-md mx-auto my-4 bg-[#F5F7FA] rounded-[36px] shadow-2xl border-8 border-gray-900 overflow-hidden relative min-h-[720px] flex flex-col font-poppins'
      }
    >
      {/* Phone Notch & Status Bar only shown in desktop simulator */}
      {!isNativeMobile && (
        <div className="bg-[#1F2937] text-white px-6 py-2.5 flex justify-between items-center text-[11px] font-semibold select-none z-30">
          <span>08:15</span>
          <div className="w-20 h-4 bg-black rounded-full shadow-inner"></div>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3 text-emerald-400" />
            <Wifi className="w-3 h-3 text-emerald-400" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      )}

      {/* Main Screen Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && (
          <div>
            {/* Toggle Switch between Check-in & Check-out in Mobile view */}
            <div className="bg-white p-2 border-b border-gray-200 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setSubView('checkin')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subView === 'checkin'
                    ? 'bg-[#0F9D58] text-white shadow-xs'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                1. Check-In (Arrivée)
              </button>
              <button
                type="button"
                onClick={() => setSubView('checkout')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subView === 'checkout'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                2. Check-Out (Fin)
              </button>
            </div>

            {subView === 'checkin' ? (
              <MobileCheckIn
                agent={safeAgent}
                onPerformCheckIn={onPerformCheckIn}
                onOpenCameraModal={onOpenCameraModal}
                photoCaptured={photoCaptured}
                onGoToCheckoutScreen={() => setSubView('checkout')}
                isCheckedIn={isCheckedIn}
                onNavigateToProfile={() => setActiveTab('profile')}
                onLogout={() => {
                  try {
                    localStorage.removeItem('klinatop_logged_agent_id');
                  } catch (e) {}
                  setIsLoggedIn(false);
                }}
              />
            ) : (
              <MobileCheckOut
                agent={safeAgent}
                onPerformCheckOut={onPerformCheckOut}
                onOpenCameraModal={onOpenCameraModal}
                photoCaptured={photoCaptured}
                checkInTime={checkInTime}
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <MobileHistory
            agentId={safeAgent.id}
            presences={presences}
            pointages={pointages}
            onInspectPhoto={onInspectPhoto}
          />
        )}

        {activeTab === 'profile' && (
          <MobileProfile
            agent={safeAgent}
            onUpdatePhoto={async (newPhotoUrl) => {
              if (onUpdateAgentPhoto && safeAgent.id) {
                await onUpdateAgentPhoto(safeAgent.id, newPhotoUrl);
              }
            }}
            onLogout={() => {
              try {
                localStorage.removeItem('klinatop_logged_agent_id');
              } catch (e) {}
              setIsLoggedIn(false);
            }}
          />
        )}
      </div>

      {/* Bottom Mobile Tab Bar */}
      <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-2.5 flex justify-around items-center z-30 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-[#0F9D58] font-bold scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Accueil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'history' ? 'text-[#0F9D58] font-bold scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Historique</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'profile' ? 'text-[#0F9D58] font-bold scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px]">Profil</span>
        </button>
      </nav>
    </div>
  );
};
