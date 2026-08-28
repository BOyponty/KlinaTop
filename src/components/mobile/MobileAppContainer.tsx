import React, { useState, useEffect } from 'react';
import { Clock, History, UserCheck, Smartphone } from 'lucide-react';
import { User, Presence, Pointage } from '../../types';
import { MobileCheckIn } from './MobileCheckIn';
import { MobileCheckOut } from './MobileCheckOut';
import { MobileHistory } from './MobileHistory';
import { MobileProfile } from './MobileProfile';
import { MobileLogin } from './MobileLogin';

export type MobileTab = 'home' | 'history' | 'profile';

interface MobileAppContainerProps {
  currentAgent: User | null;
  allAgents: User[];
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
      const savedUser = localStorage.getItem('klinatop_logged_agent_user');
      const savedId = localStorage.getItem('klinatop_logged_agent_id');
      return !!(savedUser || savedId);
    } catch {
      return false;
    }
  });

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [subView, setSubView] = useState<'checkin' | 'checkout'>('checkin');

  if (!isLoggedIn || !currentAgent) {
    return (
      <div
        className={
          isNativeMobile
            ? 'w-full min-h-screen bg-[#F5F7FA] flex flex-col font-poppins'
            : 'w-full max-w-[390px] h-[780px] bg-[#F5F7FA] rounded-[45px] shadow-2xl border-[8px] border-[#1F2937] overflow-hidden flex flex-col relative font-poppins'
        }
      >
        {/* Status Bar */}
        <div className="bg-[#1F2937] text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs select-none shrink-0">
          <span className="font-semibold">{currentTime || '08:15'}</span>
          <div className="w-20 h-4 bg-black rounded-full mx-auto" />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400 font-bold">4G</span>
            <div className="w-5 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          <MobileLogin
            allAgents={allAgents}
            onLoginSuccess={(agent) => {
              try {
                localStorage.setItem('klinatop_logged_agent_user', JSON.stringify(agent));
                localStorage.setItem('klinatop_logged_agent_id', agent.id);
              } catch (e) {}
              if (onSelectAgent) {
                onSelectAgent(agent);
              }
              setIsLoggedIn(true);
            }}
            onRegisterNewAgent={(newAgent) => {
              try {
                localStorage.setItem('klinatop_logged_agent_user', JSON.stringify(newAgent));
                localStorage.setItem('klinatop_logged_agent_id', newAgent.id);
              } catch (e) {}
              if (onRegisterNewAgent) {
                onRegisterNewAgent(newAgent);
              }
              if (onSelectAgent) {
                onSelectAgent(newAgent);
              }
              setIsLoggedIn(true);
            }}
          />
        </div>
      </div>
    );
  }

  const safeAgent: User = currentAgent;

  return (
    <div
      className={
        isNativeMobile
          ? 'w-full min-h-screen bg-[#F5F7FA] flex flex-col font-poppins relative'
          : 'w-full max-w-[390px] h-[780px] bg-[#F5F7FA] rounded-[45px] shadow-2xl border-[8px] border-[#1F2937] overflow-hidden flex flex-col relative font-poppins'
      }
    >
      {/* Mobile Top Status Bar */}
      <div className="bg-[#1F2937] text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs select-none shrink-0 z-20">
        <span className="font-semibold">{currentTime || '08:15'}</span>
        <div className="w-20 h-4 bg-black rounded-full mx-auto" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-emerald-400 font-bold">4G</span>
          <div className="w-5 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
            <div className="w-full h-full bg-emerald-400 rounded-2xs" />
          </div>
        </div>
      </div>

      {/* Check-In / Check-Out Toggle Bar */}
      {activeTab === 'home' && (
        <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-center justify-center gap-2 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => setSubView('checkin')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              subView === 'checkin'
                ? 'bg-[#0F9D58] text-white shadow-xs'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            1. Check-In (Arrivée)
          </button>
          <button
            type="button"
            onClick={() => setSubView('checkout')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              subView === 'checkout'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            2. Check-Out (Fin)
          </button>
        </div>
      )}

      {/* Main Screen Content */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        {activeTab === 'home' ? (
          subView === 'checkin' ? (
            <MobileCheckIn
              agent={safeAgent}
              onPerformCheckIn={onPerformCheckIn}
              onOpenCameraModal={onOpenCameraModal}
              photoCaptured={photoCaptured}
              isCheckedIn={isCheckedIn}
              onGoToCheckoutScreen={() => setSubView('checkout')}
              onLogout={() => {
                try {
                  localStorage.removeItem('klinatop_logged_agent_id');
                  localStorage.removeItem('klinatop_logged_agent_user');
                } catch (e) {}
                setIsLoggedIn(false);
                if (onSelectAgent) onSelectAgent(null);
              }}
              onNavigateToProfile={() => setActiveTab('profile')}
            />
          ) : (
            <MobileCheckOut
              agent={safeAgent}
              onPerformCheckOut={onPerformCheckOut}
              onOpenCameraModal={onOpenCameraModal}
              photoCaptured={photoCaptured}
              isCheckedIn={isCheckedIn}
              checkInTime={checkInTime}
              onGoToCheckinScreen={() => setSubView('checkin')}
              onLogout={() => {
                try {
                  localStorage.removeItem('klinatop_logged_agent_id');
                  localStorage.removeItem('klinatop_logged_agent_user');
                } catch (e) {}
                setIsLoggedIn(false);
                if (onSelectAgent) onSelectAgent(null);
              }}
              onNavigateToProfile={() => setActiveTab('profile')}
            />
          )
        ) : activeTab === 'history' ? (
          <MobileHistory
            agent={safeAgent}
            pointages={pointages}
            onInspectPhoto={onInspectPhoto}
          />
        ) : (
          <MobileProfile
            agent={safeAgent}
            presences={presences}
            onUpdatePhoto={onUpdateAgentPhoto}
            onLogout={() => {
              try {
                localStorage.removeItem('klinatop_logged_agent_id');
                localStorage.removeItem('klinatop_logged_agent_user');
              } catch (e) {}
              setIsLoggedIn(false);
              if (onSelectAgent) onSelectAgent(null);
            }}
          />
        )}
      </div>

      {/* Bottom Floating Navigation Tabs */}
      <nav className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-6 py-2 flex items-center justify-around z-30 shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#0F9D58]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold">Pointer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'history' ? 'text-[#0F9D58]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">Historique</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-[#0F9D58]' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </nav>
    </div>
  );
};