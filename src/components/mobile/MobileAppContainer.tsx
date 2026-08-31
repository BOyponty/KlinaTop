import React, { useState, useEffect } from 'react';
import { Home, History, User as UserIcon, Wifi, Battery, Signal } from 'lucide-react';
import { User, Presence, Pointage, RhAdminUser } from '../../types';
import { MobileLogin } from './MobileLogin';
import { MobileCheckIn } from './MobileCheckIn';
import { MobileCheckOut } from './MobileCheckOut';
import { MobileHistory } from './MobileHistory';
import { MobileProfile } from './MobileProfile';

export type MobileTab = 'home' | 'history' | 'profile';

interface MobileAppContainerProps {
  currentAgent: User | null;
  allAgents: User[];
  allAdmins?: RhAdminUser[];
  presences: Presence[];
  pointages: Pointage[];
  onPerformCheckIn: (photoUrl: string, address: string, coords?: { lat: number; lng: number }) => void;
  onPerformCheckOut: (photoUrl: string, address?: string, coords?: { lat: number; lng: number }) => void;
  onOpenCameraModal: () => void;
  photoCaptured: string | null;
  onInspectPhoto: (ptg: Pointage) => void;
  isCheckedIn: boolean;
  checkInTime: string;
  onRegisterNewAgent?: (newUser: User) => void;
  onSelectAgent?: (agent: User | null) => void;
  onUpdateAgentPhoto?: (userId: string, photoUrl: string) => Promise<void> | void;
  onSwitchToRhPortal?: () => void;
  isNativeMobile?: boolean;
}

export const MobileAppContainer: React.FC<MobileAppContainerProps> = ({
  currentAgent,
  allAgents,
  allAdmins = [],
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
  onSwitchToRhPortal,
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
      const savedUserStr = localStorage.getItem('klinatop_logged_agent_user');
      const savedId = localStorage.getItem('klinatop_logged_agent_id');
      const targetId = (savedUserStr ? JSON.parse(savedUserStr)?.id : null) || savedId;
      if (targetId) {
        setIsLoggedIn(true);
        if (allAgents && allAgents.length > 0) {
          const found = allAgents.find((a) => a.id === targetId);
          if (found && onSelectAgent) {
            onSelectAgent(found);
          }
        }
      }
    } catch (e) {
      console.warn('Sync session error', e);
    }
  }, [allAgents, onSelectAgent]);
  const [activeTab, setActiveTab] = useState<MobileTab>(() => {
    try {
      const saved = localStorage.getItem('klinatop_mobile_active_tab') as MobileTab;
      if (saved === 'home' || saved === 'history' || saved === 'profile') {
        return saved;
      }
    } catch (e) {}
    return 'home';
  });

  const [subView, setSubView] = useState<'checkin' | 'checkout'>(() => {
    try {
      const saved = localStorage.getItem('klinatop_mobile_subview');
      if (saved === 'checkin' || saved === 'checkout') {
        return saved;
      }
    } catch (e) {}
    return 'checkin';
  });

  const handleSelectTab = (tab: MobileTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('klinatop_mobile_active_tab', tab);
    } catch (e) {}
  };

  const handleSelectSubView = (sub: 'checkin' | 'checkout') => {
    setSubView(sub);
    try {
      localStorage.setItem('klinatop_mobile_subview', sub);
    } catch (e) {}
  };

  if (!isLoggedIn || !currentAgent) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen sm:min-h-[680px] sm:my-4 bg-[#F5F7FA] sm:rounded-3xl sm:shadow-xl sm:border border-gray-200 overflow-hidden flex flex-col font-poppins">
        <MobileLogin
          onLogin={(agent) => {
            try {
              localStorage.setItem('klinatop_logged_agent_id', agent.id);
              localStorage.setItem('klinatop_logged_agent_user', JSON.stringify(agent));
            } catch (e) {}
            if (onSelectAgent) onSelectAgent(agent);
            setIsLoggedIn(true);
          }}
          onRegisterAgent={(newUser) => {
            try {
              localStorage.setItem('klinatop_logged_agent_id', newUser.id);
              localStorage.setItem('klinatop_logged_agent_user', JSON.stringify(newUser));
            } catch (e) {}
            if (onRegisterNewAgent) onRegisterNewAgent(newUser);
            if (onSelectAgent) onSelectAgent(newUser);
            setIsLoggedIn(true);
          }}
          availableAgents={allAgents}
          availableAdmins={allAdmins}
          onSwitchToRhPortal={onSwitchToRhPortal}
        />
      </div>
    );
  }

  const safeAgent: User = currentAgent;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen sm:min-h-[720px] sm:my-4 bg-[#F5F7FA] sm:rounded-3xl sm:shadow-xl sm:border border-gray-200 overflow-hidden relative flex flex-col font-poppins">
      {/* Main Screen Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && (
          <div>
            {/* Toggle Switch between Check-in & Check-out in Mobile view */}
            <div className="bg-white p-2 border-b border-gray-200 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectSubView('checkin')}
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
                onClick={() => handleSelectSubView('checkout')}
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
                onGoToCheckoutScreen={() => handleSelectSubView('checkout')}
                isCheckedIn={isCheckedIn}
                onNavigateToProfile={() => handleSelectTab('profile')}
                onLogout={() => {
                  try {
                    localStorage.removeItem('klinatop_logged_agent_id');
                    localStorage.removeItem('klinatop_logged_agent_user');
                    localStorage.removeItem('klinatop_mobile_active_tab');
                    localStorage.removeItem('klinatop_mobile_subview');
                  } catch (e) {}
                  setIsLoggedIn(false);
                  if (onSelectAgent) onSelectAgent(null);
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
                localStorage.removeItem('klinatop_logged_agent_user');
                localStorage.removeItem('klinatop_mobile_active_tab');
                localStorage.removeItem('klinatop_mobile_subview');
              } catch (e) {}
              setIsLoggedIn(false);
              if (onSelectAgent) onSelectAgent(null);
            }}
          />
        )}
      </div>

      {/* Bottom Mobile Tab Bar */}
      <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-2.5 flex justify-around items-center z-30 shadow-lg">
        <button
          type="button"
          onClick={() => handleSelectTab('home')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-[#0F9D58] font-bold scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Accueil</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('history')}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
            activeTab === 'history' ? 'text-[#0F9D58] font-bold scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Historique</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab('profile')}
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
