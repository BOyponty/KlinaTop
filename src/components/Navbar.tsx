import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, LayoutDashboard, Search, Bell, Mail, RefreshCw, UserCheck, LogOut, ShieldCheck, ChevronDown, User as UserIcon } from 'lucide-react';
import { User, RhAdminUser } from '../types';

interface NavbarProps {
  currentMode: 'web' | 'mobile';
  onModeChange: (mode: 'web' | 'mobile') => void;
  currentUser: User;
  allAgents: User[];
  onSelectAgent: (agent: User) => void;
  onResetData: () => void;
  onLogoutRH?: () => void;
  isRhAuthenticated?: boolean;
  currentAdmin?: RhAdminUser | null;
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
  currentAdmin,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminName = currentAdmin?.nom || 'Responsable RH';
  const adminPoste = currentAdmin?.poste || 'Administration KlinaTop';
  const adminEmail = currentAdmin?.email || 'admin@klinatop.bj';
  const adminPhoto = currentAdmin?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

  return (
    <header className="sticky top-0 z-40 bg-[#1F2937] text-white border-b border-gray-700/80 shadow-sm px-4 lg:px-6 py-2.5">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Search Input */}
        <div className="relative w-full sm:w-72 md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher agent, site, pointage..."
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
            title="Rafraîchir les données"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Action Icons & Admin Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Bell with red badge */}
          <button
            title="Notifications"
            className="relative text-gray-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#1F2937]"></span>
          </button>

          {/* Mail Icon */}
          <button title="Messages" className="text-gray-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800">
            <Mail className="w-4 h-4" />
          </button>

          {/* User Profile Avatar with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Mon profil Administrateur"
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 hover:border-[#0F9D58] transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#0F9D58] shadow-sm bg-gray-900 shrink-0">
                <img
                  src={adminPhoto}
                  alt={adminName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-semibold text-white hidden md:inline truncate max-w-[120px]">
                {adminName.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden md:inline" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1F2937] border border-gray-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-poppins">
                <div className="px-4 py-3 border-b border-gray-700/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0F9D58] shrink-0 bg-gray-900">
                    <img src={adminPhoto} alt={adminName} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{adminName}</p>
                    <p className="text-[10px] text-emerald-400 font-medium truncate">{adminPoste}</p>
                    <p className="text-[10px] text-gray-400 truncate">{adminEmail}</p>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <div className="px-3 py-1.5 text-[11px] text-gray-400 flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D58]" />
                    <span>Rôle : {currentAdmin?.role === 'superadmin' ? 'Super Administrateur' : 'Gestionnaire RH'}</span>
                  </div>

                  {onLogoutRH && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogoutRH();
                      }}
                      className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Se déconnecter (Changer d'admin)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};