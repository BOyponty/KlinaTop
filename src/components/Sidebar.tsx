import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  MapPin,
  FileSpreadsheet,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  Camera,
} from 'lucide-react';
import { KlinaTopLogo } from './common/KlinaTopLogo';
import { RhAdminUser } from '../types';

export type WebTab =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'pointages'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: WebTab;
  onSelectTab: (tab: WebTab) => void;
  onOpenAddModal: () => void;
  totalEmployeesCount: number;
  onLogoutRH?: () => void;
  currentAdmin?: RhAdminUser | null;
  onOpenRhProfileModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  totalEmployeesCount,
  onLogoutRH,
  currentAdmin,
  onOpenRhProfileModal,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employés', icon: Users, badge: totalEmployeesCount },
    { id: 'attendance', label: 'Présences', icon: CalendarCheck },
    { id: 'pointages', label: 'Pointages', icon: MapPin },
    { id: 'reports', label: 'Rapports & Stats', icon: FileSpreadsheet },
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
    <aside className="w-64 bg-[#1B2533] text-gray-300 flex flex-col h-[calc(100vh-61px)] sticky top-[61px] border-r border-gray-800/80 shrink-0 select-none">
      {/* Brand Header inside Sidebar with official recommended KlinaTop logo */}
      <div className="p-4 border-b border-gray-800/80 flex items-center justify-between">
        <KlinaTopLogo size="sm" variant="dark" withBadge={true} />
      </div>

      {/* Quick Action Button: Add Employee */}
      <div className="px-4 py-3">
        <button
          onClick={onOpenAddModal}
          className="w-full bg-[#0F9D58] hover:bg-[#0c8047] text-white py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un employé</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as WebTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0F9D58] text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-poppins">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Section: Profile card, Support & Logout */}
      <div className="p-3 border-t border-gray-800/80 bg-gray-900/40 space-y-2">
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span className="font-poppins">Support</span>
        </button>

        <button
          onClick={onLogoutRH}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all active:scale-98 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          <span className="font-poppins">Logout</span>
        </button>
      </div>
    </aside>
  );
};