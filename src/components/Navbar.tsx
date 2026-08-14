import React from 'react';
import { Smartphone, LayoutDashboard, Search, Bell, Mail, RefreshCw, UserCheck } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentMode: 'web' | 'mobile';
  onModeChange: (mode: 'web' | 'mobile') => void;
  currentUser: User;
  allAgents: User[];
  onSelectAgent: (agent: User) => void;
  onResetData: () => void;
  onLogoutRH?: () => void;
  isRhAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  currentUser,
  allAgents,
  onSelectAgent,
  onResetData,
  onLogoutRH,
  isRhAuthenticated = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#1F2937] text-white border-b border-gray-700/80 shadow-sm px-4 lg:px-6 py-2.5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Search Input matching screenshot */}
        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-900/90 border border-gray-700/80 rounded-full pl-10 pr-4 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#0F9D58] transition-all"
          />
        </div>

        {/* View Switcher Controls & Simulator Tools */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-900/80 p-1 rounded-xl border border-gray-700/80">
            <button
              onClick={() => onModeChange('web')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'web'
                  ? 'bg-[#0F9D58] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard RH</span>
            </button>

            <button
              onClick={() => onModeChange('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentMode === 'mobile'
                  ? 'bg-[#0F9D58] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App Agent</span>
            </button>
          </div>

          {/* Agent Selector for Mobile Simulation */}
          <div className="hidden xl:flex items-center gap-1.5 bg-gray-800/80 px-2.5 py-1 rounded-xl border border-gray-700 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#0F9D58]" />
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = allAgents.find((a) => a.id === e.target.value);
                if (found) onSelectAgent(found);
              }}
              className="bg-transparent text-white text-xs font-medium outline-none cursor-pointer"
            >
              {allAgents.map((ag) => (
                <option key={ag.id} value={ag.id} className="bg-gray-900 text-white">
                  {ag.nom}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onResetData}
            title="Reset Demo Data"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action Icons & Circle Profile Avatar (matching screenshot) */}
        <div className="flex items-center gap-4">
          {/* Notification Bell with red badge */}
          <button
            title="Notifications"
            className="relative text-gray-300 hover:text-white transition-colors p-1"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#1F2937]"></span>
          </button>

          {/* Mail Icon */}
          <button title="Messages" className="text-gray-300 hover:text-white transition-colors p-1">
            <Mail className="w-5 h-5" />
          </button>

          {/* User Profile Avatar Image Circle ONLY (no text, no logout button here) */}
          <button
            onClick={onLogoutRH}
            title="Profil Responsable RH - Cliquez pour option Déconnexion"
            className="w-8 h-8 rounded-full overflow-hidden border border-gray-600 hover:border-[#0F9D58] shadow-sm bg-gray-800 shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
              alt="ZINSOU Chantal (RH)"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

