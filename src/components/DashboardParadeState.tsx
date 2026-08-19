import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, UserMinus, Plane, Calendar, Filter,
  Search, RefreshCw, Moon, ShieldAlert, Coffee,
  Plus, CalendarRange, X, Check, Sliders, Eye, EyeOff, Activity, Clock, History
} from 'lucide-react';
import { FlightName, ParadeShift, Airman, DutyCategoryCode, IDAShift, UserRole } from '../types';
import { DUTY_TYPES, DUTY_TYPE_MAP } from '../data/dutyTypes';
import { getStoredDutyRatiosForDate } from '../data/dutyRatios';
import { getIdacShiftsForDateAndFlight } from '../data/officialDutyRatioMatrix';
import { FlightDutyRatioModal } from './FlightDutyRatioModal';
import { EntryHistoryModal } from './EntryHistoryModal';

interface DashboardParadeStateProps {
  role?: UserRole;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedShift: ParadeShift;
  setSelectedShift: (shift: ParadeShift) => void;
  selectedFlight: FlightName | 'Overall';
  setSelectedFlight: (flight: FlightName | 'Overall') => void;
  onOpenPrintModal?: () => void;
  onViewAirmanProfile: (airman: Airman) => void;
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
  selectedDate,
  setSelectedDate,
  selectedFlight,
  setSelectedFlight,
  onViewAirmanProfile,
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

  // Quick Assign Duty Modal State
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignDateMode, setAssignDateMode] = useState<'single' | 'multi'>('single');
  const [assignFlight, setAssignFlight] = useState<FlightName>('Avionics');
  const [assignDutyCode, setAssignDutyCode] = useState<DutyCategoryCode>('GD');
  const [assignProxyForFlight, setAssignProxyForFlight] = useState<FlightName | ''>('');
  const [assignLeaveType, setAssignLeaveType] = useState<'Casual' | 'Annual'>('Casual');
  const [assignAirmanId, setAssignAirmanId] = useState<string>('');
  const [initialDetailedAirmanId, setInitialDetailedAirmanId] = useState<string>('');
  const [assignIdaShift, setAssignIdaShift] = useState<IDAShift>('Morning');
  const [assignFromDate, setAssignFromDate] = useState<string>(selectedDate);
  const [assignToDate, setAssignToDate] = useState<string>(selectedDate);
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState<boolean>(false);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState<string>('');

  // Flight Duty Ratio / Quota States
  const [showRatioModal, setShowRatioModal] = useState<boolean>(false);
  const [ratioRefreshTrigger, setRatioRefreshTrigger] = useState<number>(0);
  const [filterByRatio, setFilterByRatio] = useState<boolean>(true);

  // Keep date inputs updated with top selectedDate
  useEffect(() => {
    setAssignFromDate(selectedDate);
    setAssignToDate(selectedDate);
  }, [selectedDate]);

  // Helper to get required count (ratio) for a duty code on assignFromDate
  const getRequiredCountForDuty = (dutyCode: DutyCategoryCode, targetFlight?: FlightName) => {
    const currentRatios = getStoredDutyRatiosForDate(assignFromDate);
    const fl = targetFlight || assignFlight;
    const found = currentRatios.find(
      (r) => r.flight === fl && r.dutyCode === dutyCode
    );
    return found ? found.requiredCount : 0;
  };

  // Helper to calculate how many airmen are currently assigned to a duty
  const getAssignedCountForDuty = (dutyCode: DutyCategoryCode, targetFlight?: FlightName) => {
    const src = effectiveModalData || data;
    if (!src || !src.personnelStatusList) return 0;
    const fl = targetFlight || assignFlight;
    return src.personnelStatusList.filter((p) => {
      if (p.airman.flightName !== fl) return false;
      return p.dutyCode === dutyCode;
    }).length;
  };

  // Auto-navigate to flight with remaining quota when clicking duty category
  const handleSelectDutyCategory = (dutyCode: DutyCategoryCode) => {
    setAssignDutyCode(dutyCode);
    const flights: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];
    const currentRatios = getStoredDutyRatiosForDate(assignFromDate);
    
    let targetFlight: FlightName | null = null;
    for (const fl of flights) {
      const ratio = currentRatios.find((r) => r.flight === fl && r.dutyCode === dutyCode);
      const req = ratio ? ratio.requiredCount : 0;
      const assigned = (effectiveModalData?.personnelStatusList || []).filter(
        (p) => p.airman.flightName === fl && p.dutyCode === dutyCode
      ).length;
      if (req > assigned) {
        targetFlight = fl;
        break;
      }
    }
    if (!targetFlight) {
      for (const fl of flights) {
        const ratio = currentRatios.find((r) => r.flight === fl && r.dutyCode === dutyCode);
        if (ratio && ratio.requiredCount > 0) {
          targetFlight = fl;
          break;
        }
      }
    }
    if (targetFlight) {
      setAssignFlight(targetFlight);
      setAssignProxyForFlight('');
    }
  };

  // Auto select valid duty if filterByRatio is enabled and assignFlight changes
  useEffect(() => {
    if (!showAssignModal) return;
    const req = getRequiredCountForDuty(assignDutyCode);
    if (filterByRatio && req === 0) {
      const firstReq = DUTY_TYPES.find(
        (dt) => dt.code !== 'ON_PARADE' && getRequiredCountForDuty(dt.code) > 0
      );
      if (firstReq) {
        setAssignDutyCode(firstReq.code);
      }
    }
  }, [assignFlight, assignFromDate, ratioRefreshTrigger, filterByRatio, showAssignModal]);

  const [modalParadeData, setModalParadeData] = useState<ParadeData | null>(null);

  // Fetch parade state for modal's selected date (assignFromDate) so detailed personnel are 100% accurate
  useEffect(() => {
    if (!showAssignModal) return;
    let isMounted = true;
    const fetchModalParade = async () => {
      try {
        const params = new URLSearchParams({
          date: assignFromDate,
          shift: 'Morning',
          flight: 'Overall',
        });
        const res = await fetch(`/api/parade-state?${params.toString()}`);
        if (res.ok && isMounted) {
          const result = await res.json();
          setModalParadeData(result);
        }
      } catch (err) {
        console.error('Failed to fetch modal parade state for date:', assignFromDate, err);
      }
    };
    fetchModalParade();
    return () => {
      isMounted = false;
    };
  }, [showAssignModal, assignFromDate]);

  const effectiveModalData = assignFromDate === selectedDate && data ? data : (modalParadeData || data);

  // Helper to determine airman's availability status on selected date(s)
  const getAirmanCurrentStatus = (airmanId: string, useModalDate = false) => {
    const sourceData = useModalDate ? effectiveModalData : data;
    if (!sourceData || !sourceData.personnelStatusList) return { status: 'PARADE', dutyName: 'On Parade' };
    const item = sourceData.personnelStatusList.find((p) => p.airman.id === airmanId);
    if (!item) return { status: 'PARADE', dutyName: 'On Parade' };

    if (item.statusCategory === 'LEAVE') return { status: 'LEAVE', dutyName: 'On Leave' };
    if (item.statusCategory === 'TDY') return { status: 'TDY', dutyName: 'On TDY' };
    if (item.statusCategory === 'DUTY') {
      if (item.dutyCode === 'IDAC' || item.dutyCode === 'IDA') {
        const s = item.idaShift || 'Morning';
        return { status: 'DUTY', dutyName: `IDAC ${s}`, idaShift: s };
      }
      const dt = DUTY_TYPE_MAP.get(item.dutyCode as any);
      return { status: 'DUTY', dutyName: dt ? dt.name : item.dutyCode };
    }
    if (item.statusCategory === 'OFF' || item.dutyCode === 'DUTY_OFF') {
      return { status: 'OFF', dutyName: item.dutyName || 'Duty Off' };
    }
    return { status: 'PARADE', dutyName: 'On Parade' };
  };

  // Get eligible airmen for the quick assign modal (filtered by Flight, Duty Code, and Rank eligibility)
  const getModalEligibleAirmen = () => {
    if (!effectiveModalData) return [];
    // If a proxy flight is selected, filter eligible airmen from that proxy flight; otherwise from assignFlight
    const targetFlight = assignProxyForFlight ? assignProxyForFlight : assignFlight;

    return effectiveModalData.personnelStatusList
      .filter(({ airman }) => {
        if (targetFlight && airman.flightName !== targetFlight) return false;

        const st = getAirmanCurrentStatus(airman.id, true);
        if ((assignDutyCode === 'IDAC' || assignDutyCode === 'IDA') && (st.status === 'LEAVE' || st.status === 'TDY')) {
          return false;
        }

        if (assignDutyCode === 'GD') {
          const rankLower = airman.rank.toLowerCase();
          const isCplOrBelow = ['cpl', 'lac', 'ac1', 'ac2', 'corporal'].some((r) => rankLower.includes(r));
          if (!isCplOrBelow) return false;
        }

        return true;
      })
      .map(({ airman }) => airman)
      .sort((a, b) => {
        const stA = getAirmanCurrentStatus(a.id, true);
        const stB = getAirmanCurrentStatus(b.id, true);
        // If assigning IDAC Night, prioritize airman doing IDAC Morning
        if ((assignDutyCode === 'IDAC' || assignDutyCode === 'IDA') && assignIdaShift === 'Night') {
          const isAIdacMorn = (stA.dutyName || '').includes('IDAC Morning');
          const isBIdacMorn = (stB.dutyName || '').includes('IDAC Morning');
          if (isAIdacMorn && !isBIdacMorn) return -1;
          if (!isAIdacMorn && isBIdacMorn) return 1;
        }
        const order = { PARADE: 0, DUTY: 1, OFF: 2, LEAVE: 3, TDY: 4 };
        return (order[stA.status as keyof typeof order] ?? 5) - (order[stB.status as keyof typeof order] ?? 5);
      });
  };

  const modalEligibleAirmen = getModalEligibleAirmen();

  // Helper to find airmen already detailed to the selected duty and shift on assignFromDate
  const getCurrentlyDetailedPersonnel = () => {
    if (!effectiveModalData || !effectiveModalData.personnelStatusList) return [];
    return effectiveModalData.personnelStatusList.filter((p) => {
      if (p.airman.flightName !== assignFlight) return false;
      if (assignDutyCode === 'IDAC' || assignDutyCode === 'IDA') {
        return (p.dutyCode === 'IDAC' || p.dutyCode === 'IDA') && p.idaShift === assignIdaShift;
      }
      return p.dutyCode === assignDutyCode;
    });
  };

  const currentlyDetailedList = getCurrentlyDetailedPersonnel();

  // Auto select currently detailed airman or first AVAILABLE airman
  useEffect(() => {
    if (!showAssignModal) return;
    const detailed = getCurrentlyDetailedPersonnel();
    if (detailed.length > 0) {
      setAssignAirmanId(detailed[0].airman.id);
      setInitialDetailedAirmanId(detailed[0].airman.id);
    } else {
      setInitialDetailedAirmanId('');
      const eligible = getModalEligibleAirmen();
      if ((assignDutyCode === 'IDAC' || assignDutyCode === 'IDA') && assignIdaShift === 'Night') {
        const idacMorningGuy = eligible.find((a) => {
          const st = getAirmanCurrentStatus(a.id, true);
          return (st.dutyName || '').includes('IDAC Morning');
        });
        if (idacMorningGuy) {
          setAssignAirmanId(idacMorningGuy.id);
          return;
        }
      }
      const available = eligible.find((a) => getAirmanCurrentStatus(a.id, true).status === 'PARADE');
      if (available) {
        setAssignAirmanId(available.id);
      } else if (eligible.length > 0) {
        setAssignAirmanId(eligible[0].id);
      } else {
        setAssignAirmanId('');
      }
    }
  }, [assignFlight, assignProxyForFlight, assignDutyCode, assignIdaShift, assignFromDate, showAssignModal, effectiveModalData]);

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

  // Handle quick assign modal submit (supporting replace/swap and deselect)
  const handleModalAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDutyCode || !assignFromDate || !assignToDate) return;

    setAssignLoading(true);
    setAssignSuccessMsg('');
    try {
      // Handle Deselect / Clear Personnel
      if (!assignAirmanId) {
        if (initialDetailedAirmanId || currentlyDetailedList.length > 0) {
          const targetId = initialDetailedAirmanId || currentlyDetailedList[0]?.airman.id;
          await fetch('/api/roster/delete-range', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              airmanId: targetId,
              fromDate: assignFromDate,
              toDate: assignToDate,
            }),
          });
          setAssignSuccessMsg('🗑️ Duty entry cleared (Personnel returned to On Parade)!');
          window.dispatchEvent(new CustomEvent('baf_state_updated'));
          if (selectedDate !== assignFromDate) {
            setSelectedDate(assignFromDate);
          } else {
            await fetchParadeData(assignFromDate);
          }
          setTimeout(() => {
            setShowAssignModal(false);
            setAssignSuccessMsg('');
          }, 1200);
        } else {
          setShowAssignModal(false);
        }
        return;
      }

      // If replacing an existing detailed airman with a new one, remove previous airman's assignment first
      const replacingOldAirmanId = initialDetailedAirmanId && initialDetailedAirmanId !== assignAirmanId
        ? initialDetailedAirmanId
        : undefined;

      if (replacingOldAirmanId) {
        await fetch('/api/roster/delete-range', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            airmanId: replacingOldAirmanId,
            fromDate: assignFromDate,
            toDate: assignToDate,
          }),
        });
      }

      let notesPayload = assignNotes;
      if (assignDutyCode === 'LEAVE') {
        const prefix = assignLeaveType === 'Annual' ? 'Annual Leave (AL)' : 'Casual Leave (CL)';
        notesPayload = assignNotes ? `${prefix} - ${assignNotes}` : prefix;
      }

      const res = await fetch('/api/roster/assign-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: assignAirmanId,
          replaceAirmanId: replacingOldAirmanId,
          dutyCode: assignDutyCode,
          idaShift: assignDutyCode === 'IDAC' || assignDutyCode === 'IDA' ? assignIdaShift : undefined,
          proxyForFlight: assignProxyForFlight && assignFlight !== 'All' ? assignFlight : undefined,
          fromDate: assignFromDate,
          toDate: assignToDate,
          notes: notesPayload,
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok && result.success) {
        const selectedA = (effectiveModalData?.personnelStatusList || data?.personnelStatusList || []).find((p) => p.airman.id === assignAirmanId)?.airman;
        const nameLabel = selectedA ? `${selectedA.rank} ${selectedA.name}` : 'Airman';
        const prevA = replacingOldAirmanId
          ? (effectiveModalData?.personnelStatusList || data?.personnelStatusList || []).find((p) => p.airman.id === replacingOldAirmanId)?.airman
          : null;

        const replaceText = prevA ? ` (Replaced ${prevA.rank} ${prevA.name})` : '';
        setAssignSuccessMsg(`✅ Duty successfully assigned to ${nameLabel}${replaceText} for ${result.count || 1} day(s)!`);
        
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        if (selectedDate !== assignFromDate) {
          setSelectedDate(assignFromDate);
        } else {
          await fetchParadeData(assignFromDate);
        }
        
        setTimeout(() => {
          setShowAssignModal(false);
          setAssignSuccessMsg('');
        }, 1300);
      } else {
        alert(result.error || 'Failed to assign duty range');
      }
    } catch (err: any) {
      console.error('Failed to submit assign modal:', err);
      alert(`Error assigning duty: ${err?.message || 'Network request failed'}`);
    } finally {
      setAssignLoading(false);
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
            {dayName}, {selectedDate} • Unit Strength: {data?.summary.totalStrength || 48} Airmen
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="date"
              value={selectedDate}
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
              {data?.personnelStatusList?.length || data?.summary.totalStrength || 0}
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

      {/* Quick Assign Duty Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6 space-y-5 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CalendarRange className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Assign Personnel Duty
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pick duty, flight, and airman. Only available (On Parade) personnel are listed by default.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Message */}
            {assignSuccessMsg && (
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-bold animate-fadeIn">
                {assignSuccessMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleModalAssignSubmit} className="space-y-4">
              {/* 1. Date Selection: Single vs Multi-Date */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    1. Select Date Mode & Date
                  </label>
                  <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setAssignDateMode('single');
                        setAssignToDate(assignFromDate);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        assignDateMode === 'single'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      Single Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignDateMode('multi')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        assignDateMode === 'multi'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      Multi-Date (From - To)
                    </button>
                  </div>
                </div>

                {assignDateMode === 'single' ? (
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">Target Date:</span>
                    <input
                      type="date"
                      value={assignFromDate}
                      onChange={(e) => {
                        const d = e.target.value;
                        setAssignFromDate(d);
                        setAssignToDate(d);
                      }}
                      className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-xs"
                      required
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block mb-1">From Date:</span>
                      <input
                        type="date"
                        value={assignFromDate}
                        onChange={(e) => {
                          const newFrom = e.target.value;
                          setAssignFromDate(newFrom);
                          if (!assignToDate || assignToDate < newFrom) {
                            setAssignToDate(newFrom);
                          }
                        }}
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-xs"
                        required
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold block mb-1">To Date:</span>
                      <input
                        type="date"
                        value={assignToDate}
                        min={assignFromDate}
                        onChange={(e) => setAssignToDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-xs"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Duty Category Option */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <span>2. Select Duty Category</span>
                    {assignDutyCode === 'GD' && (
                      <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-1.5 py-0.5 rounded border border-red-300 dark:border-red-800">
                        GD: Cpl & Below Only
                      </span>
                    )}
                  </label>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterByRatio(!filterByRatio)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 flex items-center space-x-1"
                      title="Toggle showing only duties required by Flight Ratio vs All duties"
                    >
                      {filterByRatio ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{filterByRatio ? 'Ratio Only' : 'Show All'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRatioModal(true)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center space-x-1"
                      title="Set / Edit Flight Duty Ratios"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Ratio Config</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {(() => {
                    const allDuties = DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE');
                    const ratioFiltered = allDuties.filter((dt) => getRequiredCountForDuty(dt.code) > 0);
                    const dutiesToRender = filterByRatio && ratioFiltered.length > 0 ? ratioFiltered : allDuties;

                    return dutiesToRender.map((dt) => {
                      const isSelected = assignDutyCode === dt.code;
                      const reqCount = getRequiredCountForDuty(dt.code);
                      const assignedCount = getAssignedCountForDuty(dt.code);
                      const remainingCount = Math.max(0, reqCount - assignedCount);

                      return (
                        <button
                          key={dt.code}
                          type="button"
                          onClick={() => handleSelectDutyCategory(dt.code)}
                          className={`relative p-2.5 rounded-xl text-xs font-bold text-left border transition-all flex flex-col justify-between space-y-1.5 ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-sm bg-emerald-50/60 dark:bg-emerald-950/40'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          {/* Notification-style remaining badge on top right */}
                          {reqCount > 0 && remainingCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse z-10 border-2 border-white dark:border-slate-900">
                              {remainingCount}
                            </span>
                          )}
                          {reqCount > 0 && remainingCount === 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md z-10 border-2 border-white dark:border-slate-900" title="Target fulfilled">
                              ✓
                            </span>
                          )}

                          <div className="flex items-center justify-between w-full">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${dt.badgeBg} ${dt.badgeText}`}>
                              {dt.shortName}
                            </span>

                            {reqCount > 0 ? (
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                                Req: {reqCount}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-normal">
                                Optional
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between w-full mt-0.5">
                            <span className="truncate text-[11px] font-bold">{dt.name}</span>
                            {reqCount > 0 && (
                              <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400">
                                {assignedCount}/{reqCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Sub-Option for Leave */}
                {assignDutyCode === 'LEAVE' && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2 animate-fadeIn">
                    <label className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between">
                      <span>Leave Sub-Category</span>
                      <span className="text-[10px] font-normal text-purple-700 dark:text-purple-300">Choose type of leave</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAssignLeaveType('Casual')}
                        className={`py-1.5 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                          assignLeaveType === 'Casual'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800'
                        }`}
                      >
                        Casual Leave (CL)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssignLeaveType('Annual')}
                        className={`py-1.5 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                          assignLeaveType === 'Annual'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-800'
                        }`}
                      >
                        Annual Leave (AL / Priv)
                      </button>
                    </div>
                  </div>
                )}

                {/* IDAC Shift Picker */}
                {(assignDutyCode === 'IDAC' || assignDutyCode === 'IDA') && (() => {
                  const availableShifts = getIdacShiftsForDateAndFlight(
                    assignFromDate,
                    assignFlight
                  );
                  return (
                    <div className="space-y-1.5 bg-teal-50/50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-200 dark:border-teal-800 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-teal-800 dark:text-teal-300">
                          Select IDAC Shift
                        </label>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                          Note: Night shift is on Parade during day
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {availableShifts.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setAssignIdaShift(s)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                              assignIdaShift === s
                                ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* 3. Select Flight Option */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>3. Select Duty Flight</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {assignFlight} Flight Duty
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => {
                        setAssignFlight(fl);
                        if (assignProxyForFlight === fl) setAssignProxyForFlight('');
                      }}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all truncate ${
                        assignFlight === fl
                          ? fl === 'Avionics'
                            ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                            : fl === 'Mechanics'
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : fl === 'GCS'
                            ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                            : 'bg-slate-700 text-white border-slate-800 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {fl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Compact Proxy Duty Selection */}
              <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    Proxy Duty (Optional)
                  </label>
                  {assignProxyForFlight ? (
                    <button
                      type="button"
                      onClick={() => setAssignProxyForFlight('')}
                      className="text-[10px] text-red-600 dark:text-red-400 font-bold hover:underline"
                    >
                      Clear Proxy
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">
                      Covering other flight
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAssignProxyForFlight('')}
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition-all ${
                      !assignProxyForFlight
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Own Flt
                  </button>
                  {(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[])
                    .filter((fl) => fl !== assignFlight)
                    .map((fl) => (
                      <button
                        key={fl}
                        type="button"
                        onClick={() => setAssignProxyForFlight(fl)}
                        className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition-all ${
                          assignProxyForFlight === fl
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {fl}
                      </button>
                    ))}
                </div>
              </div>

              {/* 5. Select Airman Name Option */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    5. Select Airman
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    {modalEligibleAirmen.length} Candidates ({assignProxyForFlight ? `${assignProxyForFlight} (Proxy)` : assignFlight})
                  </span>
                </div>

                <div className="space-y-1">
                  <select
                    value={assignAirmanId}
                    onChange={(e) => setAssignAirmanId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">-- Clear / Deselect Personnel (Return to Parade) --</option>
                    {modalEligibleAirmen.map((a) => {
                      const st = getAirmanCurrentStatus(a.id, true);
                      const isIdacMorn = (st.dutyName || '').includes('IDAC Morning');
                      const isNightAssignment = (assignDutyCode === 'IDAC' || assignDutyCode === 'IDA') && assignIdaShift === 'Night';
                      const isDetailedToThis = currentlyDetailedList.some((d) => d.airman.id === a.id);
                      
                      // Available if parade or currently assigned to this or (IDAC night and is on IDAC morning)
                      const isAvailable = st.status === 'PARADE' || (isNightAssignment && isIdacMorn) || isDetailedToThis;

                      let statusDesc = '';
                      if (st.status === 'LEAVE') statusDesc = 'On Leave';
                      else if (st.status === 'TDY') statusDesc = 'On TDY';
                      else if (st.status === 'DUTY') statusDesc = st.dutyName || 'On Duty';
                      else if (st.status === 'OFF') statusDesc = st.dutyName || 'Duty Off';

                      let extraTag = '';
                      if (isNightAssignment && isIdacMorn) {
                        extraTag = ' (IDAC Morning - Recommended for Night)';
                      } else if (isDetailedToThis) {
                        extraTag = ' (Currently Detailed)';
                      } else if (!isAvailable && statusDesc) {
                        extraTag = ` - ${statusDesc}`;
                      }

                      const flightTag = assignProxyForFlight ? ` (${a.flightName})` : '';
                      const label = `${a.rank} ${a.name}${flightTag}${extraTag}`;

                      return (
                        <option
                          key={a.id}
                          value={a.id}
                          disabled={!isAvailable}
                          className={`font-semibold ${
                            isAvailable
                              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Select an available airman, or choose &quot;Clear / Deselect Personnel&quot; to return to On Parade.
                  </p>
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Night shift, special assignment, etc."
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || (!assignAirmanId && !initialDetailedAirmanId)}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                >
                  {assignLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Assign Duty Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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
                            key={item.airman.id}
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
          airmen={data?.personnelStatusList.map((p) => p.airman) || []}
          onClose={() => setShowHistoryModal(false)}
          onRefreshData={() => {
            fetchParadeData();
          }}
        />
      )}

      {/* Flight Duty Ratio Configurator Modal */}
      {showRatioModal && (
        <FlightDutyRatioModal
          date={assignFromDate || selectedDate}
          onClose={() => setShowRatioModal(false)}
          onRatiosUpdated={() => setRatioRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
};
