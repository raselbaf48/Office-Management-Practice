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
import { MonthlyDutyRegister } from './components/MonthlyDutyRegister';
import { DutyRosterPeriodView } from './components/DutyRosterPeriodView';
import { DutyRatioMatrixView } from './components/DutyRatioMatrixView';
import { DutyAnalytics } from './components/DutyAnalytics';
import { DutyConflictMonitor } from './components/DutyConflictMonitor';
import { AirmanProfileModal } from './components/AirmanProfileModal';
import { AddEditAirmanModal } from './components/AddEditAirmanModal';
import { PrintableParadeStateModal } from './components/PrintableParadeStateModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { Airman, FlightName, ParadeShift, UserRole } from './types';
import { Shield } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('overview');
  const [role, setRole] = useState<UserRole>(() => {
    const saved = sessionStorage.getItem('baf_user_role');
    return saved === 'ADMIN' ? 'ADMIN' : 'AIRMAN';
  });
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    sessionStorage.setItem('baf_user_role', newRole);
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
  const [airmen, setAirmen] = useState<Airman[]>([]);
  const [loadingAirmen, setLoadingAirmen] = useState<boolean>(true);
  const [conflictCount, setConflictCount] = useState<number>(0);

  // Modals
  const [selectedAirmanProfile, setSelectedAirmanProfile] = useState<Airman | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState<boolean>(false);
  const [airmanToEdit, setAirmanToEdit] = useState<Airman | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Fetch airmen from backend API
  const fetchAirmen = async () => {
    setLoadingAirmen(true);
    try {
      const res = await fetch('/api/airmen');
      if (res.ok) {
        const data = await res.json();
        setAirmen(data);
      }
    } catch (err) {
      console.error('Failed to fetch airmen:', err);
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

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/realtime/events');

        eventSource.onmessage = (event) => {
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
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect after 3 seconds
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
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

    // 15-second background sync fallback
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('baf_state_updated'));
    }, 15000);

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
        fetchAirmen();
      }
    } catch (err) {
      console.error('Error deleting airman:', err);
    }
  };

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
      />

      {/* Right Content Wrapper */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top Header Bar */}
        <TopHeader
          activeTab={activeTab}
          role={role}
          setRole={handleRoleChange}
          onRequestAdminAccess={() => setIsPasscodeModalOpen(true)}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          conflictCount={conflictCount}
        />

        {/* Main View Area (Opens on Right Side based on clicked tab) */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto">
          {activeTab === 'overview' && (
            <DashboardParadeState
              role={role}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedShift={selectedShift}
              setSelectedShift={setSelectedShift}
              selectedFlight={selectedFlight}
              setSelectedFlight={setSelectedFlight}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onViewAirmanProfile={(a) => setSelectedAirmanProfile(a)}
            />
          )}

          {activeTab === 'parade-state' && (
            <ParadeStateFormattedView
              role={role}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              airmen={airmen}
              onOpenPrintModal={() => setIsPrintModalOpen(true)}
              onViewAirmanProfile={(a) => setSelectedAirmanProfile(a)}
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
              onRequestAdminAccess={() => setIsPasscodeModalOpen(true)}
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
        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-5 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                155 UASU BAF • Duty & Office Management System
              </span>
            </div>
            <p>© 2026 Bangladesh Air Force • Confidential Personnel Duty Register</p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AdminPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={() => {
          handleRoleChange('ADMIN');
        }}
      />

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
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
}
