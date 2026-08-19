import React, { useState } from 'react';
import { Logo155UASU } from './Logo155UASU';
import {
  Menu,
  Sun,
  Moon,
  ShieldAlert,
  User,
  Globe,
  Bell,
  Search,
  CheckCircle,
  Shield,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import { UserRole, FlightName } from '../types';
import { SidebarTab } from './Sidebar';

interface TopHeaderProps {
  activeTab: SidebarTab;
  role: UserRole;
  setRole: (role: UserRole) => void;
  onRequestAdminAccess: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenMobileSidebar: () => void;
  conflictCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  role,
  setRole,
  onRequestAdminAccess,
  selectedDate,
  setSelectedDate,
  darkMode,
  setDarkMode,
  onOpenMobileSidebar,
  conflictCount,
}) => {
  const [lang, setLang] = useState<'BN' | 'EN'>('BN');

  // Breadcrumb / Title mapping
  const getTabTitle = (tab: SidebarTab) => {
    switch (tab) {
      case 'overview':
        return { category: 'DASHBOARD', title: 'Dashboard & Strength Overview' };
      case 'parade-state':
        return { category: 'PARADE STATE', title: 'Parade State (BAF Formatted)' };
      case 'nominal':
        return { category: 'ORG STRUCTURE', title: 'Nominal Roll (Seniority Order)' };
      case 'flights':
        return { category: 'ORG STRUCTURE', title: 'Flights & Section Overview' };
      case 'leave-register':
        return { category: 'WORKFORCE', title: 'Leave Register (CL & AL)' };
      case 'register':
        return { category: 'SCHEDULE MANAGEMENT', title: 'Monthly Duty Register' };
      case 'duty-roster':
        return { category: 'SCHEDULE MANAGEMENT', title: 'Duty Roster Period' };
      case 'duty-ratio':
        return { category: 'DUTY RATIO', title: 'Duty Ratio Matrix (Scale 1–31)' };
      case 'analytics':
        return { category: 'SCHEDULE MANAGEMENT', title: 'Duty Analytics & Load Balance' };
      case 'conflicts':
        return { category: 'SCHEDULE MANAGEMENT', title: 'Duty Conflict Monitor & Rules' };
      default:
        return { category: 'SYSTEM', title: 'BAF 155 UASU System' };
    }
  };

  const { category, title } = getTabTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Button + Logo + Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5">
            <Logo155UASU className="w-7 h-9 drop-shadow-xs" />
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <span>{category}</span>
                <span>•</span>
                <span>155 UASU BAF</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none mt-0.5">
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Switcher Badge */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => setLang('BN')}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                lang === 'BN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="text-xs">🇧🇩</span>
              <span>বাংলা</span>
            </button>
            <button
              onClick={() => setLang('EN')}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                lang === 'EN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="text-xs">🇬🇧</span>
              <span>ENG</span>
            </button>
          </div>

          {/* Role Switcher with Passcode Guard */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <button
              onClick={() => {
                if (role !== 'ADMIN') {
                  onRequestAdminAccess();
                }
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
                role === 'ADMIN'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={role === 'ADMIN' ? 'Admin Mode (Full Edit Privileges)' : 'Click to enter Admin Passcode (1124)'}
            >
              {role === 'ADMIN' ? (
                <Unlock className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">Admin SNCO</span>
            </button>

            <button
              onClick={() => setRole('AIRMAN')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
                role === 'AIRMAN'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Airman View Mode (Read-only view with all filters active)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Airman View</span>
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-800"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Profile Badge */}
          <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-xs border ${
              role === 'ADMIN'
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-blue-600 text-white border-blue-400'
            }`}>
              {role === 'ADMIN' ? 'SNCO' : 'AIR'}
            </div>
            <div className="text-left leading-none">
              <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center space-x-1">
                <span>{role === 'ADMIN' ? 'Admin SNCO (In-Charge)' : 'Airman View'}</span>
                {role === 'ADMIN' ? (
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Admin Active" />
                ) : (
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500" title="Read Only Active" />
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {role === 'ADMIN' ? 'Full Edit Access' : 'Read-Only Mode'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
