/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardParadeState } from './components/DashboardParadeState';
import { ParadeStateFormattedView } from './components/ParadeStateFormattedView';
import { NominalRoll } from './components/NominalRoll';
import { FlightsMiniView } from './components/FlightsMiniView';
import { LeaveRegisterView } from './components/LeaveRegisterView';
import { TdyRegisterView } from './components/TdyRegisterView';
import { AttachmentRegisterView } from './components/AttachmentRegisterView';
import { IdaCenterDutyView } from './components/IdaCenterDutyView';
import { MonthlyDutyRegister } from './components/MonthlyDutyRegister';
import { DutyRosterPeriodView } from './components/DutyRosterPeriodView';
import { DutyRatioMatrixView } from './components/DutyRatioMatrixView';
import { DutyAnalytics } from './components/DutyAnalytics';
import { DutyConflictMonitor } from './components/DutyConflictMonitor';
import { AirmanProfileModal } from './components/AirmanProfileModal';
import { AddEditAirmanModal } from './components/AddEditAirmanModal';
import { PrintableParadeStateModal } from './components/PrintableParadeStateModal';
import { PdfDutyImportModal } from './components/PdfDutyImportModal';
import { UserLoginDetailModal } from './components/UserLoginDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { UserLoginGate } from './components/UserLoginGate';
import { Airman, FlightName, ParadeShift, UserRole, ThemePreference } from './types';
import { INITIAL_AIRMEN } from './data/initialAirmen';
import { Logo155UASU } from './components/Logo155UASU';
import { Shield } from 'lucide-react';
import { getCurrentUserSession, clearUserSession, UserSession } from './utils/authSession';

export default function App() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [role, setRole] = useState<UserRole>(() => {
    const saved = sessionStorage.getItem('baf_user_role');
    if (saved === 'SUPER_ADMIN') return 'SUPER_ADMIN';
    return saved === 'ADMIN' ? 'ADMIN' : 'USER';
  });
  const [userSession, setUserSession] = useState<UserSession | null>(() => getCurrentUserSession());
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);
  
  // Theme Preference State (Light / Dark / System)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('baf_theme_pref');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'dark';
  });
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Apply Theme Preference to document and darkMode state
  useEffect(() => {
    localStorage.setItem('baf_theme_pref', themePreference);

    const applyTheme = () => {
      if (themePreference === 'dark') {
        document.documentElement.classList.add('dark');
        setDarkMode(true);
      } else if (themePreference === 'light') {
        document.documentElement.classList.remove('dark');
        setDarkMode(false);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
          setDarkMode(true);
        } else {
          document.documentElement.classList.remove('dark');
          setDarkMode(false);
        }
      }
    };

    applyTheme();

    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          setDarkMode(true);
        } else {
          document.documentElement.classList.remove('dark');
          setDarkMode(false);
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themePreference]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    sessionStorage.setItem('baf_user_role', newRole);
    if (
      newRole === 'USER' &&
      activeTab !== 'overview' &&
      activeTab !== 'parade-state' &&
      activeTab !== 'pt-state' &&
      activeTab !== 'ida-center'
    ) {
      setActiveTab('overview');
    }
  };

  const handleUserLogout = () => {
    clearUserSession();
    setUserSession(null);
    handleRoleChange('USER');
  };

  // Restrict access for non-admin viewers: allow Dashboard, Parade State, PT State, and IDA Center Duty
  useEffect(() => {
    if (
      role === 'USER' &&
      activeTab !== 'overview' &&
      activeTab !== 'parade-state' &&
      activeTab !== 'pt-state' &&
      activeTab !== 'ida-center' &&
      activeTab !== 'duty-roster'
    ) {
      setActiveTab('overview');
    }
  }, [role, activeTab]);

  const handleManualDarkModeToggle = (dark: boolean) => {
    setThemePreference(dark ? 'dark' : 'light');
  };

  // Sidebar Layout States
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Filters
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedShift, setSelectedShift] = useState<ParadeShift>('Morning');
  const [selectedFlight, setSelectedFlight] = useState<FlightName | 'Overall'>('Overall');

  // Data
  const [airmen, setAirmen] = useState<Airman[]>(INITIAL_AIRMEN);
  const [loadingAirmen, setLoadingAirmen] = useState<boolean>(false);
  const [conflictCount, setConflictCount] = useState<number>(0);

  // Modals
  const [selectedAirmanProfile, setSelectedAirmanProfile] = useState<Airman | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [airmanToEdit, setAirmanToEdit] = useState<Airman | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isPdfImportModalOpen, setIsPdfImportModalOpen] = useState<boolean>(false);

  // Fetch airmen from backend API with graceful fallback
  const fetchAirmen = async () => {
    try {
      const res = await fetch('/api/airmen');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAirmen(data);
        }
      }
    } catch (err) {
      // Fallback already provided by INITIAL_AIRMEN
    } finally {
      setLoadingAirmen(false);
    }
  };

  useEffect(() => {
    fetchAirmen();
  }, []);

  // Real-time EventSource Listener & Auto-sync across all clients
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let failureCount = 0;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/realtime/events');

        eventSource.onmessage = (event) => {
          failureCount = 0;
          try {
            const data = JSON.parse(event.data);
            if (
              data.type === 'DATA_UPDATED' ||
              data.type === 'ROSTER_UPDATED' ||
              data.type === 'AIRMEN_UPDATED' ||
              data.type === 'PARADE_UPDATED'
            ) {
              fetchAirmen();
              window.dispatchEvent(new CustomEvent('baf_state_updated', { detail: data }));
            }
          } catch {
            // Ignore parse errors on raw messages or pings
          }
        };

        eventSource.onerror = () => {
          failureCount++;
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // On static hosting (like Cloudflare Pages), realtime events fall back to periodic polling
          if (failureCount < 3) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(connectSSE, 10000);
          }
        };
      } catch (err) {
        // SSE not supported or offline
      }
    };

    connectSSE();

    // Re-fetch when tab becomes visible or focused
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAirmen();
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // 30-second background sync fallback
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('baf_state_updated'));
    }, 30000);

    return () => {
      if (eventSource) eventSource.close();
      clearTimeout(reconnectTimeout);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Fetch conflict count for sidebar indicator
  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const monthKey = selectedDate.slice(0, 7);
        const res = await fetch(`/api/analytics?month=${monthKey}`);
        if (res.ok) {
          const data = await res.json();
          setConflictCount((data.conflictAlerts || []).length);
        }
      } catch (err) {
        console.error('Failed to fetch conflict count:', err);
      }
    };
    fetchConflicts();
    const handleGlobalUpdate = () => {
      fetchConflicts();
      fetchAirmen();
    };
    window.addEventListener('baf_state_updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('baf_state_updated', handleGlobalUpdate);
    };
  }, [selectedDate]);

  // Handle dark mode class on root HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Airman CRUD Handlers
  const handleSaveAirman = async (airmanData: Partial<Airman>) => {
    try {
      if (airmanToEdit) {
        const res = await fetch(`/api/airmen/${airmanToEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(airmanData),
        });
        if (res.ok) {
          fetchAirmen();
        }
      } else {
        const res = await fetch('/api/airmen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(airmanData),
        });
        if (res.ok) {
          fetchAirmen();
        }
      }
    } catch (err) {
      console.error('Error saving airman:', err);
    } finally {
      setAirmanToEdit(null);
    }
  };

  const handleSyncGoogleSheet = async () => {
    const res = await fetch('/api/sync-google-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetUrl: 'https://docs.google.com/spreadsheets/d/1tsmdZI55KL6IbPhPsRqBpGWR9uTIeDE474xF36g96nY/export?format=csv',
      }),
    });
    if (!res.ok) {
      throw new Error('Failed to sync sheet');
    }
    await fetchAirmen();
  };

  const handleDeleteAirman = async (airmanId: string) => {
    try {
      const res = await fetch(`/api/airmen/${airmanId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchAirmen();
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
      }
    } catch (err) {
      console.error('Error deleting airman:', err);
    }
  };

  // User Login Gate: Only render login interface when not authenticated
  if (!userSession) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
        <UserLoginGate
          airmen={airmen}
          onAuthenticated={() => {
            const sess = getCurrentUserSession();
            setUserSession(sess);
            handleRoleChange('USER');
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        conflictCount={conflictCount}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        airmenCount={airmen.length}
        userSession={userSession}
        onOpenImportModal={() => setIsPdfImportModalOpen(true)}
                        onLogoutUser={handleUserLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
                onLogoutAdmin={() => handleRoleChange('USER')}
      />

      {/* Right Content Wrapper */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 print:min-h-0 print:pl-0 print:p-0 print:bg-white ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top Header Bar */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          role={role}
          userSession={userSession}
                              onLogoutUser={handleUserLogout}
        />

        {/* Main View Area (Opens on Right Side based on clicked tab) */}
        <main className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto ${isPrintModalOpen ? 'print:hidden' : ''}`}>
          {activeTab === 'overview' && (
            <DashboardParadeState
              role={role}
              airmen={airmen}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedShift={selectedShift}
              setSelectedShift={setSelectedShift}
              selectedFlight={selectedFlight}
              setSelectedFlight={setSelectedFlight}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onViewAirmanProfile={(a) => setSelectedAirmanProfile(a)}
              onOpenImportModal={() => setIsPdfImportModalOpen(true)}
            />
          )}

          {activeTab === 'parade-state' && (
            <ParadeStateFormattedView
              role={role}
              airmen={airmen}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              initialDocumentType="PARADE"
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onViewAirmanProfile={(a) => setSelectedAirmanProfile(a)}
              onOpenImportModal={() => setIsPdfImportModalOpen(true)}
            />
          )}

          {activeTab === 'pt-state' && (
            <ParadeStateFormattedView
              role={role}
              airmen={airmen}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              initialDocumentType="PT"
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onViewAirmanProfile={(a) => setSelectedAirmanProfile(a)}
              onOpenImportModal={() => setIsPdfImportModalOpen(true)}
            />
          )}

          {activeTab === 'nominal' && (
            <NominalRoll
              airmen={airmen}
              role={role}
              onRefresh={fetchAirmen}
              onSyncGoogleSheet={handleSyncGoogleSheet}
              onAddAirman={() => {
                setAirmanToEdit(null);
                setIsAddEditOpen(true);
              }}
              onEditAirman={(a) => {
                setAirmanToEdit(a);
                setIsAddEditOpen(true);
              }}
              onDeleteAirman={handleDeleteAirman}
              onViewProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'flights' && (
            <FlightsMiniView
              role={role}
              airmen={airmen}
              onSelectFlight={(fl) => {
                setSelectedFlight(fl);
                setActiveTab('nominal');
              }}
              onViewAirmanHistory={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'leave-register' && (
            <LeaveRegisterView
              role={role}
              airmen={airmen}
              onViewProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'tdy-register' && (
            <TdyRegisterView
              role={role}
              airmen={airmen}
              onViewProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}
          {activeTab === 'attachment-register' && (
            <AttachmentRegisterView
              role={role}
              airmen={airmen}
              onViewProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'ida-center' && (
            <IdaCenterDutyView
              role={role}
              airmen={airmen}
              selectedDate={selectedDate}
              onViewAirmanProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'register' && (
            <MonthlyDutyRegister
              airmen={airmen}
              role={role}
              conflictCount={conflictCount}
              setConflictCount={setConflictCount}
              onViewProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'duty-roster' && (
            <DutyRosterPeriodView
              role={role}
              airmen={airmen}
              onViewProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'duty-ratio' && (
            <DutyRatioMatrixView
              role={role}
                          />
          )}

          {activeTab === 'analytics' && (
            <DutyAnalytics
              airmen={airmen}
              onViewProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'conflicts' && (
            <DutyConflictMonitor
              airmen={airmen}
              onViewProfile={(a) => setSelectedAirmanProfile(a)}
              onNavigateToRegister={() => setActiveTab('register')}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-5 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <Logo155UASU className="h-6 w-6" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                155 UASU BAF • Duty & Office Management System
              </span>
            </div>
            <p>© 2026 Bangladesh Air Force • Confidential Personnel Duty Register</p>
          </div>
        </footer>

      </div>

      {/* Modals */}
      
      {selectedAirmanProfile && (
        <AirmanProfileModal
          airman={selectedAirmanProfile}
          onClose={() => setSelectedAirmanProfile(null)}
        />
      )}

      {isAddEditOpen && (
        <AddEditAirmanModal
          airmanToEdit={airmanToEdit}
          onSave={handleSaveAirman}
          onClose={() => {
            setIsAddEditOpen(false);
            setAirmanToEdit(null);
          }}
        />
      )}

      {isPrintModalOpen && (
        <PrintableParadeStateModal
          date={selectedDate}
          shift={selectedShift}
          flight={selectedFlight}
          airmen={airmen}
          documentType={activeTab === 'pt-state' ? 'PT' : 'PARADE'}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* AI PDF / Image Duty Data Import Modal */}
      <PdfDutyImportModal
        isOpen={isPdfImportModalOpen}
        onClose={() => setIsPdfImportModalOpen(false)}
        airmen={airmen}
        onImportSuccess={(dates) => {
          if (dates && dates.length > 0) {
            setSelectedDate(dates[0]);
          }
          window.dispatchEvent(new CustomEvent('baf_state_updated'));
        }}
        onNavigateToTab={(tab, date) => {
          if (date) setSelectedDate(date);
          setActiveTab(tab);
        }}
      />

      {/* System Settings Modal (Theme, Passcode, Import History, Backup) */}
      <AdminPasscodeModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={(newRole) => {
          handleRoleChange(newRole);
          setIsAdminLoginModalOpen(false);
        }}
        assignedRole={userSession?.assignedRole || 'USER'}
        bdNo={userSession?.bdNo}
      />

      <UserLoginDetailModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        nominalAirmen={airmen}
        userSessionRole={role}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        role={role}
        currentTheme={themePreference}
        onThemeChange={(newTheme) => setThemePreference(newTheme)}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenUserManagement={() => {
          setIsSettingsModalOpen(false);
          setIsUserManagementOpen(true);
        }}
        onRosterUpdated={() => {
          fetchAirmen();
          window.dispatchEvent(new CustomEvent('baf_state_updated'));
        }}
      />
    </div>
  );
}
