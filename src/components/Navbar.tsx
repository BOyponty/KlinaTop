import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, LayoutDashboard, Bell, Mail, RefreshCw, LogOut, ShieldCheck, ChevronDown, Camera } from 'lucide-react';
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
  const adminPhoto = currentAdmin?.photoUrl;
  const adminInitials = currentAdmin?.initiales || (
    adminName.trim()
      ? adminName.trim().split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'RH'
  );

  return (
    <header className="sticky top-0 z-40 bg-[#1F2937] text-white border-b border-gray-700/80 shadow-sm px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Gauche : Identique à la photo 1 */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#0F9D58]" />
          <span>Portail d'entreprise KlinaTop</span>
        </div>

        {/* Centre : Boutons Dashboard RH / App Agent + Bouton Rafraîchir */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-xl border border-gray-700/80">
            <button
              type="button"
              onClick={() => onModeChange('web')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentMode === 'web'
                  ? 'bg-[#0F9D58] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard RH</span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentMode === 'mobile'
                  ? 'bg-[#0F9D58] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App Agent</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onResetData}
            title="Rafraîchir les données"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Droite : Non connecté ou Profil RH connecté */}
        <div className="flex items-center gap-3 shrink-0">
          {isRhAuthenticated && currentAdmin && currentMode === 'web' ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                title="Notifications"
                className="relative text-gray-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#0F9D58] rounded-full ring-2 ring-[#1F2937]"></span>
              </button>

              <button
                type="button"
                title="Messages"
                className="text-gray-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-800 cursor-pointer hidden sm:block"
              >
                <Mail className="w-4 h-4" />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  title="Mon profil Administrateur"
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 hover:border-[#0F9D58] transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-[#0F9D58] shadow-sm bg-gray-900 shrink-0 flex items-center justify-center">
                    {adminPhoto ? (
                      <img src={adminPhoto} alt={adminName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#0F9D58] text-white flex items-center justify-center text-[10px] font-bold">
                        {adminInitials}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white hidden md:inline truncate max-w-[120px]">
                    {adminName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden md:inline" />
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
                        <p className="text-[10px] text-emerald-400 font-medium truncate">{adminPoste}</p>
                        <p className="text-[10px] text-gray-400 truncate">{adminEmail}</p>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="px-3 py-1.5 text-[11px] text-gray-400 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D58]" />
                        <span>Rôle : {currentAdmin?.role === 'superadmin' ? 'Super Administrateur' : 'Gestionnaire RH'}</span>
                      </div>

                      {onOpenRhProfileModal && (
                        <button
                          type="button"
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
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onLogoutRH();
                          }}
                          className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Se déconnecter de l'espace RH</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-900/60 rounded-full border border-gray-800 text-[11px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Non connecté</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};