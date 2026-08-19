import React, { useState, useEffect } from 'react';
import { Airman, FlightName, UserRole } from '../types';
import { Calendar, Search, Filter, Printer, Download, Eye, ShieldCheck, Sun, Moon, Plus, RefreshCw, X, Check, FileText, History } from 'lucide-react';
import { sortAirmenBySeniority } from '../utils/seniority';
import { EntryHistoryModal } from './EntryHistoryModal';

interface LeaveRegisterViewProps {
  role?: UserRole;
  airmen: Airman[];
  onViewProfile?: (airman: Airman) => void;
}

interface LeaveRecord {
  airmanId: string;
  casualLeaveDays: number;
  annualLeaveDays: number;
  recreationLeaveDays: number;
  totalLeaveDays: number;
  weekendDaysExcluded: number;
  currentlyOnLeave: boolean;
  currentLeaveType?: 'Casual Leave' | 'Annual Leave' | 'Recreation Leave' | 'Leave';
  currentLeaveRange?: string;
  leaveEntries: Array<{
    date: string;
    type: 'Casual Leave' | 'Annual Leave' | 'Recreation Leave' | 'Leave';
    notes?: string;
    isWeekend?: boolean;
  }>;
}

// Helper to check if a date string is Friday or Saturday (BAF weekend)
const isWeekendDay = (dateStr: string): boolean => {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const day = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return day === 5 || day === 6; // 5 = Friday, 6 = Saturday
  } catch {
    return false;
  }
};

// Helper to calculate Net Leave days between two dates excluding Friday and Saturday
const calculateNetLeaveDays = (startStr: string, endStr: string): { totalDays: number; netDays: number; weekendDays: number } => {
  try {
    const [sY, sM, sD] = startStr.split('-').map(Number);
    const [eY, eM, eD] = endStr.split('-').map(Number);
    const curr = new Date(Date.UTC(sY, sM - 1, sD));
    const end = new Date(Date.UTC(eY, eM - 1, eD));
    let total = 0;
    let weekend = 0;
    let net = 0;
    let limit = 0;

    while (curr <= end && limit < 366) {
      total++;
      const day = curr.getUTCDay();
      if (day === 5 || day === 6) {
        weekend++;
      } else {
        net++;
      }
      curr.setUTCDate(curr.getUTCDate() + 1);
      limit++;
    }
    return { totalDays: total, netDays: net, weekendDays: weekend };
  } catch {
    return { totalDays: 1, netDays: 1, weekendDays: 0 };
  }
};

export const LeaveRegisterView: React.FC<LeaveRegisterViewProps> = ({
  role = 'ADMIN',
  airmen,
  onViewProfile,
}) => {
  const [selectedFlight, setSelectedFlight] = useState<FlightName | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(() => String(new Date().getFullYear()));
  const [leaveData, setLeaveData] = useState<Record<string, LeaveRecord>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Grant / Record Leave Modal
  const [showGrantLeaveModal, setShowGrantLeaveModal] = useState<boolean>(false);
  const [leaveAirmanId, setLeaveAirmanId] = useState<string>('');
  const [leaveType, setLeaveType] = useState<'Casual' | 'Annual' | 'Recreation'>('Casual');
  const [leaveFromDate, setLeaveFromDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [leaveToDate, setLeaveToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [leaveNotes, setLeaveNotes] = useState<string>('Casual Leave (CL)');
  const [savingLeave, setSavingLeave] = useState<boolean>(false);
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState<string>('');

  // Fetch all assignments for the year to calculate Casual, Annual, and Recreation leave (excluding Friday & Saturday)
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      // Fetch all 12 months of the year
      const months = Array.from({ length: 12 }, (_, i) => {
        const m = String(i + 1).padStart(2, '0');
        return `${selectedYear}-${m}`;
      });

      const allAssignmentsPromises = months.map((mKey) =>
        fetch(`/api/roster?month=${mKey}`)
          .then(async (res) => {
            if (!res.ok) return [];
            const data = await res.json();
            if (data && Array.isArray(data.assignments)) {
              return data.assignments;
            }
            if (Array.isArray(data)) {
              return data;
            }
            return [];
          })
          .catch(() => [])
      );

      const monthlyResults = await Promise.all(allAssignmentsPromises);
      const allAssignments = monthlyResults.flat();

      const todayStr = new Date().toISOString().split('T')[0];
      const recordMap: Record<string, LeaveRecord> = {};

      // Initialize for all airmen
      airmen.forEach((a) => {
        recordMap[a.id] = {
          airmanId: a.id,
          casualLeaveDays: 0,
          annualLeaveDays: 0,
          recreationLeaveDays: 0,
          totalLeaveDays: 0,
          weekendDaysExcluded: 0,
          currentlyOnLeave: false,
          leaveEntries: [],
        };
      });

      // Process leave assignments per airman
      Object.keys(recordMap).forEach((airmanId) => {
        const rec = recordMap[airmanId];
        const airmanLeaveAssignments = allAssignments
          .filter((ass: any) => ass && ass.dutyCode === 'LEAVE' && ass.airmanId === airmanId && ass.date)
          .sort((a: any, b: any) => a.date.localeCompare(b.date));

        if (airmanLeaveAssignments.length === 0) return;

        // Group into contiguous date spans
        const spans: Array<Array<any>> = [];
        let currentSpan: any[] = [];

        airmanLeaveAssignments.forEach((ass: any) => {
          if (currentSpan.length === 0) {
            currentSpan.push(ass);
          } else {
            const prevAss = currentSpan[currentSpan.length - 1];
            const prevDate = new Date(prevAss.date);
            const currDate = new Date(ass.date);
            const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              currentSpan.push(ass);
            } else {
              spans.push(currentSpan);
              currentSpan = [ass];
            }
          }
        });
        if (currentSpan.length > 0) {
          spans.push(currentSpan);
        }

        // Process each contiguous span
        spans.forEach((span) => {
          const spanLength = span.length;
          const isSpanAnnual = spanLength > 7;

          span.forEach((ass) => {
            const notesLower = (ass.notes || '').toLowerCase();
            const hasRecreationNote = notesLower.includes('recreation') || notesLower.includes('(rl)') || notesLower.includes(' rl') || notesLower.includes('rec leave');
            const hasCasualNote = notesLower.includes('casual') || notesLower.includes('(cl)') || notesLower.includes(' cl');
            const hasAnnualNote = notesLower.includes('annual') || notesLower.includes('(al)') || notesLower.includes(' al');

            let type: 'Casual Leave' | 'Annual Leave' | 'Recreation Leave' | 'Leave' = 'Casual Leave';
            if (hasRecreationNote) {
              type = 'Recreation Leave';
            } else if (hasAnnualNote || isSpanAnnual) {
              type = 'Annual Leave';
            } else if (hasCasualNote) {
              type = 'Casual Leave';
            } else {
              type = spanLength > 7 ? 'Annual Leave' : 'Casual Leave';
            }

            const isWeekend = isWeekendDay(ass.date);

            // If Friday or Saturday, exclude from leave balance count
            if (isWeekend) {
              rec.weekendDaysExcluded++;
            } else {
              if (type === 'Recreation Leave') {
                rec.recreationLeaveDays++;
              } else if (type === 'Annual Leave') {
                rec.annualLeaveDays++;
              } else {
                rec.casualLeaveDays++;
              }
              rec.totalLeaveDays++;
            }

            rec.leaveEntries.push({
              date: ass.date,
              type,
              notes: ass.notes,
              isWeekend,
            });

            if (ass.date === todayStr) {
              rec.currentlyOnLeave = true;
              rec.currentLeaveType = type;
            }
          });
        });
      });

      setLeaveData(recordMap);
    } catch (err) {
      console.error('Failed to load leave records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    const handleGlobalUpdate = () => {
      fetchLeaves();
    };
    window.addEventListener('baf_state_updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('baf_state_updated', handleGlobalUpdate);
    };
  }, [selectedYear, airmen]);

  // Handle Granting Leave
  const handleGrantLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveAirmanId) {
      alert('Please select an airman');
      return;
    }
    if (!leaveFromDate || !leaveToDate || leaveFromDate > leaveToDate) {
      alert('Invalid date range');
      return;
    }

    setSavingLeave(true);
    try {
      const shortCode = leaveType === 'Casual' ? 'CL' : leaveType === 'Annual' ? 'AL' : 'RL';
      const notes = `${leaveType} Leave (${shortCode})${leaveNotes ? `: ${leaveNotes}` : ''}`;
      const res = await fetch('/api/roster/assign-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: leaveAirmanId,
          dutyCode: 'LEAVE',
          fromDate: leaveFromDate,
          toDate: leaveToDate,
          notes,
        }),
      });

      const result = await res.json().catch(() => ({}));
      if (res.ok && result.success) {
        const found = airmen.find((a) => a.id === leaveAirmanId);
        const { totalDays, netDays, weekendDays } = calculateNetLeaveDays(leaveFromDate, leaveToDate);
        setLeaveSuccessMsg(
          `✅ ${leaveType} Leave granted to ${found?.rank} ${found?.name}: ${netDays} Net Leave day(s) (${weekendDays} Fri/Sat weekend days excluded)!`
        );
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        await fetchLeaves();
        setTimeout(() => {
          setShowGrantLeaveModal(false);
          setLeaveSuccessMsg('');
        }, 1500);
      } else {
        alert(result.error || 'Failed to grant leave');
      }
    } catch (err: any) {
      console.error('Error granting leave:', err);
      alert(`Failed to grant leave: ${err.message}`);
    } finally {
      setSavingLeave(false);
    }
  };

  // Sort airmen by seniority
  const sortedAirmen = sortAirmenBySeniority(airmen);

  // Filter airmen
  const filteredAirmen = sortedAirmen.filter((a) => {
    if (selectedFlight !== 'All' && a.flightName !== selectedFlight) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        a.name.toLowerCase().includes(q) ||
        a.bdNo.toLowerCase().includes(q) ||
        a.rank.toLowerCase().includes(q) ||
        a.trade.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate totals
  const leaveRecords: LeaveRecord[] = Object.values(leaveData);
  const totalCasual = leaveRecords.reduce((sum: number, r: LeaveRecord) => sum + r.casualLeaveDays, 0);
  const totalAnnual = leaveRecords.reduce((sum: number, r: LeaveRecord) => sum + r.annualLeaveDays, 0);
  const totalRecreation = leaveRecords.reduce((sum: number, r: LeaveRecord) => sum + r.recreationLeaveDays, 0);
  const totalNetLeave = leaveRecords.reduce((sum: number, r: LeaveRecord) => sum + r.totalLeaveDays, 0);
  const totalWeekendExcluded = leaveRecords.reduce((sum: number, r: LeaveRecord) => sum + r.weekendDaysExcluded, 0);
  const totalOnLeaveToday = leaveRecords.filter((r: LeaveRecord) => r.currentlyOnLeave).length;

  const modalDaysCalc = calculateNetLeaveDays(leaveFromDate, leaveToDate);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Workforce Management • 155 UASU BAF</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Leave Register (ছুটি রেজিস্টার • CL / AL / RL)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Casual, Annual & Recreation Leave tracking with automatic Friday & Saturday weekend exclusion rule.
          </p>
        </div>

        {/* Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
          {/* Year selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <span className="text-slate-500 mr-2">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-black outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2027">2027</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchLeaves}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
            title="Refresh Leave Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Entry History & Undo Button */}
          {role === 'ADMIN' && (
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs shadow-xs transition-colors"
              title="View Entry History, revert wrong entries, or edit"
            >
              <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>History / Undo</span>
            </button>
          )}

          {/* Record / Grant Leave Button */}
          <button
            onClick={() => {
              if (airmen.length > 0 && !leaveAirmanId) {
                setLeaveAirmanId(airmen[0].id);
              }
              setShowGrantLeaveModal(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Grant Leave</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Register</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            Casual Leave (CL)
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {totalCasual} <span className="text-xs font-semibold text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Casual leave in {selectedYear}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            Annual Leave (AL)
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalAnnual} <span className="text-xs font-semibold text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Annual privilege leave</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            Recreation Leave (RL)
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {totalRecreation} <span className="text-xs font-semibold text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Recreation leave (RL)</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            Net Leave Consumed
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {totalNetLeave} <span className="text-xs font-semibold text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
            {totalWeekendExcluded > 0 ? `(${totalWeekendExcluded} Fri/Sat excluded)` : 'Fri & Sat excluded'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            Currently On Leave
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {totalOnLeaveToday} <span className="text-xs font-semibold text-slate-400">Airmen</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active leave status today</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Flight Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {(['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as const).map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFlight(fl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
                selectedFlight === fl
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {fl === 'All' ? 'All Flights (48)' : `${fl} Flight`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, BD, trade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 text-center w-12">Ser</th>
                <th className="py-3 px-4">BD No</th>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Flight</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-3 text-center bg-sky-50 dark:bg-sky-950/30 text-sky-900 dark:text-sky-300">
                  Casual (CL)
                </th>
                <th className="py-3 px-3 text-center bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">
                  Annual (AL)
                </th>
                <th className="py-3 px-3 text-center bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300">
                  Recreation (RL)
                </th>
                <th className="py-3 px-3 text-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 font-black">
                  Net Days <span className="text-[9px] font-normal block text-emerald-700 dark:text-emerald-400">(Excl. Fri/Sat)</span>
                </th>
                <th className="py-3 px-3 text-center text-slate-500 dark:text-slate-400">
                  Fri/Sat Excl.
                </th>
                <th className="py-3 px-4 text-center">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading Leave Register...
                  </td>
                </tr>
              ) : filteredAirmen.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    No airmen match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredAirmen.map((airman, idx) => {
                  const rec = leaveData[airman.id] || {
                    casualLeaveDays: 0,
                    annualLeaveDays: 0,
                    recreationLeaveDays: 0,
                    totalLeaveDays: 0,
                    weekendDaysExcluded: 0,
                    currentlyOnLeave: false,
                    leaveEntries: [],
                  };

                  return (
                    <tr
                      key={airman.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {airman.bdNo}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-black text-[11px]">
                          {airman.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                        <button
                          onClick={() => onViewProfile && onViewProfile(airman)}
                          className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline text-left cursor-pointer"
                          title="Click to view full duty & leave history"
                        >
                          {airman.name}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                        {airman.flightName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {airman.trade}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-sky-700 dark:text-sky-300 bg-sky-50/50 dark:bg-sky-950/20">
                        {rec.casualLeaveDays > 0 ? (
                          <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/60 rounded-full">
                            {rec.casualLeaveDays}d
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
                        {rec.annualLeaveDays > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded-full">
                            {rec.annualLeaveDays}d
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20">
                        {rec.recreationLeaveDays > 0 ? (
                          <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 rounded-full">
                            {rec.recreationLeaveDays}d
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20">
                        {rec.totalLeaveDays > 0 ? (
                          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/70 rounded-full font-black text-xs">
                            {rec.totalLeaveDays} Days
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {rec.weekendDaysExcluded > 0 ? (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                            +{rec.weekendDaysExcluded}d
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {rec.currentlyOnLeave ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 font-black text-[10px] animate-pulse">
                            On {rec.currentLeaveType || 'Leave'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onViewProfile && onViewProfile(airman)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center space-x-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>History</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant / Record Leave Modal */}
      {showGrantLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Grant / Record Airman Leave
                  </h3>
                  <p className="text-xs text-slate-400">Record Casual (CL), Annual (AL), or Recreation Leave (RL)</p>
                </div>
              </div>
              <button
                onClick={() => setShowGrantLeaveModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {leaveSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl text-center">
                {leaveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleGrantLeaveSubmit} className="space-y-4">
              {/* Select Airman */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Select Airman (BD No & Rank)
                </label>
                <select
                  value={leaveAirmanId}
                  onChange={(e) => setLeaveAirmanId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  {airmen.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bdNo} • {a.rank} {a.name} ({a.flightName} Flight)
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type (Casual vs Annual vs Recreation) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Leave Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLeaveType('Casual');
                      setLeaveNotes('Casual Leave (CL)');
                    }}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      leaveType === 'Casual'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Casual (CL)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeaveType('Annual');
                      setLeaveNotes('Annual Leave (AL)');
                    }}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      leaveType === 'Annual'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Annual (AL)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeaveType('Recreation');
                      setLeaveNotes('Recreation Leave (RL)');
                    }}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      leaveType === 'Recreation'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Recreation (RL)
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={leaveFromDate}
                    onChange={(e) => {
                      const newFrom = e.target.value;
                      setLeaveFromDate(newFrom);
                      if (!leaveToDate || leaveToDate < newFrom) {
                        setLeaveToDate(newFrom);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={leaveToDate}
                    min={leaveFromDate}
                    onChange={(e) => setLeaveToDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Real-time duration & Weekend Exclusion summary badge */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
                  <span>Net Leave Duration:</span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {modalDaysCalc.netDays} Day{modalDaysCalc.netDays > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 flex items-center justify-between">
                  <span>Total Calendar Span: {modalDaysCalc.totalDays} day(s)</span>
                  {modalDaysCalc.weekendDays > 0 ? (
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      ⚡ {modalDaysCalc.weekendDays} weekend day(s) (Fri/Sat) excluded from leave count
                    </span>
                  ) : (
                    <span>No Fri/Sat in this span</span>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Leave Details / Station Out Note
                </label>
                <input
                  type="text"
                  value={leaveNotes}
                  onChange={(e) => setLeaveNotes(e.target.value)}
                  placeholder="e.g. Recreation Leave (RL) - Station Leave"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGrantLeaveModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLeave}
                  className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  {savingLeave ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Record Leave</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entry History & Revert Modal */}
      {showHistoryModal && (
        <EntryHistoryModal
          airmen={airmen}
          onClose={() => setShowHistoryModal(false)}
          onRefreshData={() => {
            fetchLeaves();
          }}
        />
      )}
    </div>
  );
};
