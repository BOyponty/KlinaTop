import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, LayoutDashboard, Search, Bell, Mail, RefreshCw, LogOut, ShieldCheck, ChevronDown, Camera } from 'lucide-react';
import { RhAdminUser } from '../types';

interface NavbarProps {
  currentMode: 'web' | 'mobile';
  onModeChange: (mode: 'web' | 'mobile') => void;
  onResetData: () => void;
  onLogoutRH?: () => void;
  onOpenRhProfileModal?: () => void;
  isRhAuthenticated?: boolean;
  currentAdmin?: RhAdminUser | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onModeChange,
  onResetData,
  onLogoutRH,
  onOpenRhProfileModal,
  isRhAuthenticated = true,
  currentAdmin,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminName = currentAdmin?.nom || 'Responsable RH';
  const adminPoste = currentAdmin?.poste || 'Administration KlinaTop';
  const adminEmail = currentAdmin?.email || 'admin@klinatop.bj';
  const adminPhoto = currentAdmin?.photoUrl;
  const adminInitials = currentAdmin?.initiales || (
    adminName.trim()
      ? adminName.trim().split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'RH'
  );

  return (
    <header className="sticky top-0 z-40 bg-[#1F2937] text-white border-b border-gray-700/80 shadow-sm px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher agent, équipe, site, matricule..."
              className="w-full bg-gray-800/80 border border-gray-700 text-xs text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-[#0F9D58] focus:ring-1 focus:ring-[#0F9D58] placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Right Section: View Switcher, Notifications & Admin Profile */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Platform View Switcher (Desktop Web Dashboard vs Mobile Agent View) */}
          <div className="flex items-center bg-gray-800/90 p-1 rounded-xl border border-gray-700">
            <button
              onClick={() => onModeChange('web')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentMode === 'web'
                  ? 'bg-[#0F9D58] text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Espace RH (Web)</span>
            </button>
            <button
              onClick={() => onModeChange('mobile')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentMode === 'mobile'
                  ? 'bg-[#0F9D58] text-white shadow-sm'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">App Agent (Mobile)</span>
            </button>
          </div>

          {/* Notification & Messages Icons */}
          <div className="flex items-center gap-1">
            <button
              title="Notifications"
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#0F9D58] absolute top-1.5 right-1.5 ring-2 ring-[#1F2937]" />
            </button>

            <button
              title="Messages internes"
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-colors hidden sm:block"
            >
              <Mail className="w-4 h-4" />
            </button>

            <button
              onClick={onResetData}
              title="Rafraîchir les données"
              className="p-2 text-gray-300 hover:text-amber-400 hover:bg-gray-800 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-700 mx-1 hidden sm:block" />

          {/* Connected HR Admin Profile & Menu */}
          {isRhAuthenticated && (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                title="Mon profil Administrateur"
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 hover:border-[#0F9D58] transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#0F9D58] shadow-sm bg-gray-900 shrink-0 flex items-center justify-center">
                  {adminPhoto ? (
                    <img
                      src={adminPhoto}
                      alt={adminName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0F9D58] text-white flex items-center justify-center text-[10px] font-bold">
                      {adminInitials}
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-white hidden md:inline truncate max-w-[120px]">
                  {adminName.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-68 bg-[#1F2937] border border-gray-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-poppins">
                  <div className="px-4 py-3 border-b border-gray-700/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#0F9D58] shrink-0 bg-gray-900 flex items-center justify-center">
                      {adminPhoto ? (
                        <img src={adminPhoto} alt={adminName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#0F9D58] to-emerald-400 text-white flex items-center justify-center text-sm font-black">
                          {adminInitials}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{adminName}</p>
                      <p className="text-[11px] text-gray-400 truncate">{adminPoste}</p>
                      <p className="text-[10px] text-emerald-400 truncate">{adminEmail}</p>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D58]" />
                      <span>Rôle : {currentAdmin?.role === 'superadmin' ? 'Super Administrateur' : 'Gestionnaire RH'}</span>
                    </div>

                    {onOpenRhProfileModal && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenRhProfileModal();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all text-left cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Modifier photo & profil RH</span>
                      </button>
                    )}

                    {onLogoutRH && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogoutRH();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Se déconnecter de l'espace RH</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};