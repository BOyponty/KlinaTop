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
} from 'lucide-react';
import { KlinaTopLogo } from './common/KlinaTopLogo';

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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  totalEmployeesCount,
  onLogoutRH,
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

  return (
    <aside className="w-64 bg-[#1B2533] text-gray-300 flex flex-col h-[calc(100vh-61px)] sticky top-[61px] border-r border-gray-800/80 shrink-0 select-none">
      {/* Brand Header inside Sidebar with official recommended KlinaTop logo */}
      <div className="p-4 border-b border-gray-800/60 flex flex-col items-center justify-center">
        <KlinaTopLogo variant="compact" size="sm" lightBackground={false} />
      </div>

      {/* Add Employee CTA Button */}
      <div className="p-4">
        <button
          onClick={onOpenAddModal}
          className="w-full bg-[#0F9D58] hover:bg-[#0c8047] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-900/20 transition-all transform active:scale-98"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-poppins font-medium">Add Employee</span>
        </button>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as WebTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#0F9D58] text-white shadow-md font-semibold'
                  : item.highlight
                  ? 'text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-gray-400'
                  }`}
                />
                <span className="font-poppins">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
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

      {/* Bottom Footer Section: Support & Logout (matching mockup) */}
      <div className="p-3 border-t border-gray-800/80 bg-gray-900/40 space-y-1">
        <button
          onClick={() => alert('Support RH KlinaTop: Contactez support@klinatop.bj ou le +229 01 00 00 00.')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <HelpCircle className="w-5 h-5 text-gray-400" />
          <span className="font-poppins">Support</span>
        </button>

        <button
          onClick={onLogoutRH}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all active:scale-98"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="font-poppins">Logout</span>
        </button>
      </div>
    </aside>
  );
};

