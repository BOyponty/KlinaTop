import React from 'react';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  MapPin,
  BarChart3,
  Download,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  Camera,
} from 'lucide-react';
import logoImg from '../assets/images/klinatop_logo_1786547596570.jpg';
import { RhAdminUser } from '../types';

export type WebTab =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'pointages'
  | 'reports'
  | 'payroll'
  | 'settings';

interface SidebarProps {
  activeTab: WebTab;
  onSelectTab: (tab: WebTab) => void;
  onOpenAddModal: () => void;
  totalEmployeesCount: number;
  onLogoutRH?: () => void;
  currentAdmin?: RhAdminUser | null;
  onOpenRhProfileModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  totalEmployeesCount,
  onLogoutRH,
  currentAdmin,
  onOpenRhProfileModal,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users, badge: totalEmployeesCount },
    { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
    { id: 'pointages', label: 'Pointages Direct', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'payroll', label: 'Exporter Paie', icon: Download, highlight: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminName = currentAdmin?.nom || 'Responsable RH';
  const adminPoste = currentAdmin?.poste || 'Administration';
  const adminPhoto = currentAdmin?.photoUrl;
  const adminInitials = currentAdmin?.initiales || (
    adminName.trim()
      ? adminName.trim().split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'RH'
  );

  return (
    <aside className="w-full md:w-64 bg-[#1B2533] text-gray-300 flex flex-col md:h-[calc(100vh-61px)] md:sticky top-[49px] sm:top-[57px] border-b md:border-b-0 md:border-r border-gray-800/80 shrink-0 select-none">
      {/* Brand Header inside Sidebar with official centered KlinaTop logo badge - desktop only */}
      <div className="hidden md:flex pt-5 pb-3 flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white rounded-2xl p-1.5 shadow-md border border-gray-100 flex items-center justify-center transition-transform hover:scale-105">
          <img
            src={logoImg}
            alt="KlinaTop Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Add Employee CTA Button - desktop */}
      <div className="hidden md:block px-4 py-2">
        <button
          onClick={onOpenAddModal}
          className="w-full bg-[#0F9D58] hover:bg-[#0c8047] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-900/20 transition-all transform active:scale-98 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-poppins font-medium">Add Employee</span>
        </button>
      </div>

      {/* Main Navigation Links: Horizontal scroll on mobile, vertical list on desktop */}
      <nav className="flex md:flex-col overflow-x-auto md:overflow-y-auto px-2 md:px-3 py-2 md:py-0 space-x-1.5 md:space-x-0 md:space-y-1 scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as WebTab)}
              className={`flex items-center justify-between px-3 md:px-3.5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#0F9D58] text-white shadow-md font-semibold'
                  : item.highlight
                  ? 'text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Icon
                  className={`w-4 h-4 md:w-5 md:h-5 ${
                    isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-gray-400'
                  }`}
                />
                <span className="font-poppins whitespace-nowrap">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`hidden md:inline-block text-xs px-2 py-0.5 rounded-full font-bold ml-2 ${
                    isActive ? 'bg-white text-[#0F9D58]' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Section: Profile card, Support & Logout (desktop) */}
      <div className="hidden md:block p-3 border-t border-gray-800/80 bg-gray-900/40 space-y-2 mt-auto">
        {currentAdmin && (
          <button
            onClick={onOpenRhProfileModal}
            title="Modifier ma photo et profil RH"
            className="w-full flex items-center gap-3 p-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 border border-gray-700/60 hover:border-emerald-500/50 transition-all text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500 shrink-0 bg-gray-900 flex items-center justify-center relative">
              {adminPhoto ? (
                <img src={adminPhoto} alt={adminName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#0F9D58] text-white flex items-center justify-center text-xs font-bold">
                  {adminInitials}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                {adminName}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {adminPoste}
              </p>
            </div>
          </button>
        )}

        <button
          onClick={() => alert('Support RH KlinaTop: Contactez support@klinatop.bj ou le +229 01 00 00 00.')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span className="font-poppins">Support</span>
        </button>

        <button
          onClick={onLogoutRH}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all active:scale-98"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span className="font-poppins">Logout</span>
        </button>
      </div>
    </aside>
  );
};

