import { DateNavigator } from './DateNavigator';
import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, UserMinus, Plane, Calendar, Filter,
  Search, RefreshCw, Moon, ShieldAlert, Coffee,
  Plus, CalendarRange, X, Check, Sliders, Eye, EyeOff, Activity, Clock, History, Sparkles, CheckSquare, Square
} from 'lucide-react';
import { FlightName, ParadeShift, Airman, DutyCategoryCode, IDAShift, UserRole } from '../types';
import { DUTY_TYPES, DUTY_TYPE_MAP } from '../data/dutyTypes';
import { getStoredDutyRatiosForDate } from '../data/dutyRatios';
import { getIdacShiftsForDateAndFlight, getFlightDutyQuotaForDate } from '../data/officialDutyRatioMatrix';
import { FlightDutyRatioModal } from './FlightDutyRatioModal';
import { EntryHistoryModal } from './EntryHistoryModal';
import { AssignDutyModal } from './AssignDutyModal';

interface DashboardParadeStateProps {
  role?: UserRole;
  airmen?: Airman[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedShift: ParadeShift;
  setSelectedShift: (shift: ParadeShift) => void;
  selectedFlight: FlightName | 'Overall';
  setSelectedFlight: (flight: FlightName | 'Overall') => void;
  onOpenPrintModal?: () => void;
  onViewAirmanProfile: (airman: Airman) => void;
  onOpenImportModal?: () => void;
}

interface ParadeData {
  date: string;
  shift: ParadeShift;
  flight: string;
  summary: {
    totalStrength: number;
    onParade: number;
    onDuty: number;
    onLeave: number;
    tdy: number;
    otherOff: number;
  };
  flightBreakdown: Record<FlightName, {
    total: number;
    onParade: number;
    onDuty: number;
    onLeave: number;
    tdy: number;
  }>;
  personnelStatusList: Array<{
    airman: Airman;
    dutyCode: string;
    idaShift?: string;
    statusCategory: 'PARADE' | 'DUTY' | 'LEAVE' | 'TDY' | 'OFF';
    notes: string;
    dutyName?: string;
    previousDutyName?: string;
  }>;
}

export const DashboardParadeState: React.FC<DashboardParadeStateProps> = ({
  role = 'ADMIN',
  airmen,
  selectedDate,
  setSelectedDate,
  selectedFlight,
  setSelectedFlight,
  onViewAirmanProfile,
  onOpenImportModal,
}) => {
  const [data, setData] = useState<ParadeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Strength Category Detail List Modal State (When clicking Strength Cards)
  const [strengthCategoryModal, setStrengthCategoryModal] = useState<{
    title: string;
    category: 'TOTAL' | 'PARADE' | 'DUTY' | 'DUTY_OFF' | 'LEAVE' | 'TDY' | 'BAKE_N_BITE';
    color: string;
  } | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');

  // Interactive Batch Assign Duty Modal State
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);

  // Flight Duty Ratio / Quota States
  const [showRatioModal, setShowRatioModal] = useState<boolean>(false);
  const [ratioRefreshTrigger, setRatioRefreshTrigger] = useState<number>(0);

  // Listen to global duty ratio updates across modals and views
  useEffect(() => {
    const handleRatioUpdated = () => {
      setRatioRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener('baf_duty_ratio_updated', handleRatioUpdated);
    return () => {
      window.removeEventListener('baf_duty_ratio_updated', handleRatioUpdated);
    };
  }, []);

  const fetchParadeData = async (targetDate?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: targetDate || selectedDate,
        shift: 'Morning',
        flight: selectedFlight,
      });
      const res = await fetch(`/api/parade-state?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch parade state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParadeData();
    const handleGlobalUpdate = () => {
      fetchParadeData();
    };
    window.addEventListener('baf_state_updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('baf_state_updated', handleGlobalUpdate);
    };
  }, [selectedDate, selectedFlight]);

  // Compute day of week
  const dateObj = new Date(selectedDate);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  const flightsList: (FlightName | 'Overall')[] = [
    'Overall',
    'Avionics',
    'Mechanics',
    'GCS',
    'Admin',
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              155 UASU BAF • Operations Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              Active Unit
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {dayName}, {selectedDate} • Unit Strength: {data?.summary?.totalStrength || 48} Airmen
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <DateNavigator
              
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold cursor-pointer text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Flight Dropdown Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFlight}
              onChange={(e) => setSelectedFlight(e.target.value as FlightName | 'Overall')}
              className="bg-transparent outline-none font-semibold cursor-pointer text-slate-900 dark:text-slate-100"
            >
              {flightsList.map((fl) => (
                <option key={fl} value={fl} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {fl}
                </option>
              ))}
            </select>
          </div>

          {/* Import Roster Button (Admin Only) */}
          {role === 'ADMIN' && onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center space-x-1.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs px-3 py-2 rounded-lg shadow-xs transition-all cursor-pointer"
              title="Import Duty Roster from PDF / Image (Gemini AI Powered)"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Import Roster</span>
            </button>
          )}

          {/* Last Entry Button (Admin Only) */}
          {role === 'ADMIN' && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 transition-all shadow-xs"
              title="View Last 10 Entries, undo wrong entries, or edit assignments"
            >
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Last Entry</span>
            </button>
          )}

          {/* Assign Duty Button (Admin Only) */}
          {role === 'ADMIN' && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-lg shadow-xs transition-all"
              title="Assign or update duty (GD, Halishahar, Taskforce, etc.)"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Assign Duty</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchParadeData}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Click to open nominal list) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* 1. Total Strength */}
        <div
          onClick={() => {
            setModalSearchQuery('');
            setStrengthCategoryModal({
              title: 'Total Unit Strength',
              category: 'TOTAL',
              color: 'slate',
            });
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Str
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-slate-200 transition-colors">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {data?.personnelStatusList?.length || data?.summary?.totalStrength || 0}
            </span>
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 flex items-center space-x-0.5">
              <span>View</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* 2. On Parade */}
        <div
          onClick={() => {
            setModalSearchQuery('');
            setStrengthCategoryModal({
              title: 'On Parade Personnel',
              category: 'PARADE',
              color: 'emerald',
            });
          }}
          className="bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-500 rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              On Parade
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {data?.summary?.onParade ?? data?.personnelStatusList?.filter((p) => p.statusCategory === 'PARADE').length ?? 0}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-0.5">
              <span>Available</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* 3. On Duty */}
        <div
          onClick={() => {
            setModalSearchQuery('');
            setStrengthCategoryModal({
              title: 'Active On Duty Personnel',
              category: 'DUTY',
              color: 'amber',
            });
          }}
          className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/50 hover:border-amber-500 rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              On Duty
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 transition-colors">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {data?.summary?.onDuty ?? data?.personnelStatusList?.filter((p) => p.statusCategory === 'DUTY').length ?? 0}
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-0.5">
              <span>Duties</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* 4. Duty Off */}
        <div
          onClick={() => {
            setModalSearchQuery('');
            setStrengthCategoryModal({
              title: 'Duty Off Personnel',
              category: 'DUTY_OFF',
              color: 'indigo',
            });
          }}
          className="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/50 hover:border-indigo-500 rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Duty Off
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-200 transition-colors">
              <Moon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {data?.summary?.otherOff ?? data?.personnelStatusList?.filter((p) => p.statusCategory === 'OFF' || p.dutyCode === 'DUTY_OFF').length ?? 0}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-0.5">
              <span>Rest</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* 5. On Leave */}
        <div
          onClick={() => {
            setModalSearchQuery('');
            setStrengthCategoryModal({
              title: 'On Leave Personnel (Casual & Annual)',
              category: 'LEAVE',
              color: 'purple',
            });
          }}
          className="bg-white dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/50 hover:border-purple-500 rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              On Leave
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 transition-colors">
              <UserMinus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {data?.summary?.onLeave ?? data?.personnelStatusList?.filter((p) => p.statusCategory === 'LEAVE').length ?? 0}
            </span>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-0.5">
              <span>Leave</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* 6. Temporary Duty (TDY) */}
        <div
          onClick={() => {
            setModalSearchQuery('');
            setStrengthCategoryModal({
              title: 'TDY (Temporary Duty Outstation)',
              category: 'TDY',
              color: 'cyan',
            });
          }}
          className="bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/50 hover:border-cyan-500 rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
              TDY
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-200 transition-colors">
              <Plane className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {data?.summary?.tdy ?? data?.personnelStatusList?.filter((p) => p.statusCategory === 'TDY').length ?? 0}
            </span>
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center space-x-0.5">
              <span>TDY</span>
              <span>→</span>
            </span>
          </div>
        </div>

        {/* 7. Bake N Bite */}
        <div
          onClick={() => {
            setModalSearchQuery('');
            setStrengthCategoryModal({
              title: 'Bake N Bite Catering Personnel',
              category: 'BAKE_N_BITE',
              color: 'rose',
            });
          }}
          className="bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/50 hover:border-rose-500 rounded-xl p-3.5 shadow-xs cursor-pointer hover:shadow-md transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Bake N Bite
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:bg-rose-200 transition-colors">
              <Coffee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {data?.summary?.bakeNBite ?? data?.personnelStatusList?.filter((p) => p.dutyCode === 'BAKE_N_BITE').length ?? 0}
            </span>
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-0.5">
              <span>Mess</span>
              <span>→</span>
            </span>
          </div>
        </div>
      </div>

      {/* Operational Overview Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-sm mb-3">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Unit Availability Summary</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Total unit personnel on parade today: <strong className="text-emerald-600 dark:text-emerald-400">{data?.summary?.onParade || 0}</strong> out of <strong className="text-slate-900 dark:text-slate-100">{data?.summary?.totalStrength || 48}</strong> airmen.
            Currently <strong className="text-amber-600 dark:text-amber-400">{data?.summary?.onDuty || 0}</strong> personnel are deployed on base guard duties, IDAC operations, and Halishahar shifts.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-sm mb-3">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Quick Operations Action</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            Click any KPI card above to view the detailed nominal list for that category, or use the <strong>Assign Duty</strong> button to quickly assign GD, IDAC, Halishahar, or Leave.
          </p>
        </div>
      </div>

      {/* Interactive Batch Assign Duty Modal */}
      {showAssignModal && (
        <AssignDutyModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onRefreshParadeData={fetchParadeData}
          airmen={airmen || data?.personnelStatusList?.map((p) => p.airman) || []}
        />
      )}


      {/* Strength Category Detailed Nominal Modal */}
      {strengthCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-4 relative overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {strengthCategoryModal.title}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {(() => {
                        const items = (data?.personnelStatusList || []).filter((p) => {
                          const cat = strengthCategoryModal.category;
                          if (cat === 'TOTAL') return true;
                          if (cat === 'PARADE') return p.dutyCode === 'ON_PARADE' || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift === 'Night');
                          if (cat === 'DUTY') return ['GD', 'BTF', 'NTF', 'HALISHAHAR', 'AIRPORT'].includes(p.dutyCode) || ((p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift !== 'Night');
                          if (cat === 'DUTY_OFF') return p.dutyCode === 'DUTY_OFF';
                          if (cat === 'LEAVE') return p.statusCategory === 'LEAVE';
                          if (cat === 'TDY') return p.statusCategory === 'TDY';
                          if (cat === 'BAKE_N_BITE') return p.dutyCode === 'BAKE_N_BITE';
                          return true;
                        });
                        return items.length;
                      })()} Personnel
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Date: <strong>{selectedDate}</strong> {selectedFlight !== 'Overall' ? `• Flight: ${selectedFlight}` : '• Entire Unit'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setStrengthCategoryModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Rank, Name, Trade, or BD Number..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            {/* Personnel Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              {(() => {
                const hideBdNo = ['PARADE', 'DUTY', 'DUTY_OFF'].includes(strengthCategoryModal.category);
                const filtered = (data?.personnelStatusList || [])
                  .filter((p) => {
                    const cat = strengthCategoryModal.category;
                    if (cat === 'TOTAL') return true;
                    if (cat === 'PARADE') return p.statusCategory === 'PARADE';
                    if (cat === 'DUTY') return p.statusCategory === 'DUTY';
                    if (cat === 'DUTY_OFF') return p.statusCategory === 'OFF' || p.dutyCode === 'DUTY_OFF';
                    if (cat === 'LEAVE') return p.statusCategory === 'LEAVE';
                    if (cat === 'TDY') return p.statusCategory === 'TDY';
                    if (cat === 'BAKE_N_BITE') return p.dutyCode === 'BAKE_N_BITE';
                    return true;
                  })
                  .filter((p) => {
                    if (!modalSearchQuery.trim()) return true;
                    const q = modalSearchQuery.toLowerCase();
                    return (
                      p.airman.name.toLowerCase().includes(q) ||
                      p.airman.rank.toLowerCase().includes(q) ||
                      p.airman.trade.toLowerCase().includes(q) ||
                      p.airman.bdNo.toLowerCase().includes(q)
                    );
                  });

                return (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      <tr>
                        <th className="py-2 px-3 w-10 text-center">#</th>
                        {!hideBdNo && <th className="py-2 px-3">BD No</th>}
                        <th className="py-2 px-3">Rank</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Trade</th>
                        <th className="py-2 px-3">Flight</th>
                        <th className="py-2 px-3">Status / Duty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={hideBdNo ? 6 : 7} className="py-8 text-center text-slate-400 text-xs">
                            No personnel found matching the criteria.
                          </td>
                        </tr>
                      ) : (
                        filtered.map((item, idx) => (
                          <tr
                            key={`${item.airman.id}-${item.dutyCode || ''}-${item.idaShift || ''}-${idx}`}
                            onClick={() => onViewAirmanProfile(item.airman)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                          >
                            <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            {!hideBdNo && (
                              <td className="py-2 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                                {item.airman.bdNo}
                              </td>
                            )}
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                              {item.airman.rank}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                              {item.airman.name}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                              {item.airman.trade}
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {item.airman.flightName}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 ${
                                item.dutyCode === 'BAKE_N_BITE'
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                                  : item.dutyCode === 'DUTY_OFF' || item.statusCategory === 'OFF'
                                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                                  : item.statusCategory === 'PARADE'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                                  : item.statusCategory === 'DUTY'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                                  : item.statusCategory === 'LEAVE'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800'
                                  : item.statusCategory === 'TDY'
                                  ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}>
                                <span>
                                  {(() => {
                                    if (item.dutyCode === 'BAKE_N_BITE') return '☕ Bake N Bite';
                                    if (item.dutyCode === 'DUTY_OFF' || item.statusCategory === 'OFF') {
                                      const prev = (item.previousDutyName || item.dutyName || item.notes || '').toUpperCase();
                                      if (prev.includes('GD') || prev.includes('BASE SEC')) return '🌙 GD Off';
                                      if (prev.includes('BTF')) return '🌙 BTF Off';
                                      if (prev.includes('NTF') || prev.includes('NAJIR')) return '🌙 NTF Off';
                                      if (prev.includes('IDAC') || prev.includes('IDA')) return '🌙 IDAC Nt Off';
                                      if (prev.includes('AIR') || prev.includes('PORT')) return '🌙 Airport Off';
                                      if (prev.includes('HALI')) return '🌙 Halishahar Off';
                                      if (item.previousDutyName) return `🌙 ${item.previousDutyName}`;
                                      if (item.dutyName && !item.dutyName.toLowerCase().includes('duty off')) return `🌙 ${item.dutyName}`;
                                      return '🌙 Duty Off';
                                    }
                                    if (item.statusCategory === 'DUTY') {
                                      if (item.dutyCode === 'GD') return '📌 Guard Duty';
                                      if (item.dutyCode === 'BTF') return '📌 Base Taskforce Duty';
                                      if (item.dutyCode === 'NTF') return '📌 Najirpara Taskforce Duty';
                                      if (item.dutyCode === 'HALISHAHAR') return '📌 Halishahar Duty';
                                      if (item.dutyCode === 'AIRPORT') return '📌 Airport Duty';
                                      if (item.dutyCode === 'IDAC' || item.dutyCode === 'IDA') return `📌 IDAC Duty (${item.idaShift || 'Morning'})`;
                                      return `📌 ${item.dutyName || item.dutyCode}`;
                                    }
                                    if (item.statusCategory === 'LEAVE') return `🏖️ ${item.dutyName || 'Leave'}`;
                                    if (item.statusCategory === 'TDY') return `✈️ ${item.notes ? `TDY (${item.notes})` : 'TDY'}`;
                                    if (item.statusCategory === 'PARADE') return '🟢 On Parade';
                                    return item.dutyCode;
                                  })()}
                                </span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-[11px] text-slate-400">
                Click any airman to view full personnel record
              </span>
              <button
                type="button"
                onClick={() => setStrengthCategoryModal(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all"
              >
                Close List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry History & Undo Modal */}
      {showHistoryModal && (
        <EntryHistoryModal
          airmen={data?.personnelStatusList?.map((p) => p.airman) || []}
          onClose={() => setShowHistoryModal(false)}
          onRefreshData={() => {
            fetchParadeData();
          }}
        />
      )}

      {/* Flight Duty Ratio Configurator Modal */}
      {showRatioModal && (
        <FlightDutyRatioModal
          date={selectedDate}
          onClose={() => setShowRatioModal(false)}
          onRatiosUpdated={() => setRatioRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
};
