const fs = require('fs');

const tabFile = 'src/components/AssignLeaveTab.tsx';

let output = `import React, { useState, useMemo, useEffect } from 'react';
import { Airman, FlightName } from '../types';
import { getCurrentUserSession } from '../utils/authSession';
import { DateNavigator } from './DateNavigator';
import { Calendar, RefreshCw, Check } from 'lucide-react';

interface AssignLeaveTabProps {
  airmen: Airman[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignLeaveTab: React.FC<AssignLeaveTabProps> = ({ airmen, onClose, onSuccess }) => {
  const session = getCurrentUserSession();
  const isAdmin = session?.assignedRole === 'ADMIN';
  const adminFlight = session?.flightName;
  const isSuperAdmin = session?.assignedRole === 'SUPER_ADMIN';
  const todayStr = new Date().toISOString().split('T')[0];

  const [grantLeaveFlight, setGrantLeaveFlight] = useState<FlightName>('Avionics');
  const [leaveAirmanId, setLeaveAirmanId] = useState<string>('');
  const [leaveFromDate, setLeaveFromDate] = useState<string>(todayStr);
  const [leaveToDate, setLeaveToDate] = useState<string>(todayStr);
  const [leaveType, setLeaveType] = useState<'Casual' | 'Annual' | 'Recreation'>('Casual');
  
  // F-295 and custom days logic
  const [includeF295, setIncludeF295] = useState<boolean>(false);
  const [f295Option, setF295Option] = useState<'2' | '3' | 'custom'>('2');
  const [f295CustomDays, setF295CustomDays] = useState<number>(0);
  const [selectedPresetDays, setSelectedPresetDays] = useState<number | null>(null);
  const [customLeaveDays, setCustomLeaveDays] = useState<number>(1);
  const [isCustomPresetActive, setIsCustomPresetActive] = useState<boolean>(false);

  const [savingLeave, setSavingLeave] = useState<boolean>(false);
  const [leaveSuccessMsg, setLeaveSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (isAdmin && adminFlight) {
      setGrantLeaveFlight(adminFlight);
    }
  }, [isAdmin, adminFlight]);

  const grantAirmenList = useMemo(() => {
    return airmen.filter((a) => a.flightName === grantLeaveFlight).sort((a, b) => a.name.localeCompare(b.name));
  }, [airmen, grantLeaveFlight]);

  // Derived Values & Handlers
  const leaveDurationDays = useMemo(() => {
    if (!leaveFromDate || !leaveToDate) return 0;
    const f = new Date(leaveFromDate);
    const t = new Date(leaveToDate);
    return Math.max(0, Math.round((t.getTime() - f.getTime()) / (1000 * 3600 * 24)) + 1);
  }, [leaveFromDate, leaveToDate]);

  useEffect(() => {
    if (leaveDurationDays <= 10) setLeaveType('Casual');
  }, [leaveDurationDays]);

  const handlePresetToggle = (days: number) => {
    if (selectedPresetDays === days) {
      setSelectedPresetDays(null);
      setLeaveToDate(leaveFromDate);
    } else {
      setSelectedPresetDays(days);
      setIsCustomPresetActive(false);
      if (leaveFromDate) {
        const d = new Date(leaveFromDate);
        d.setDate(d.getDate() + days - 1);
        setLeaveToDate(d.toISOString().split('T')[0]);
      }
    }
  };

  const handleCustomLeaveDaysChange = (days: number) => {
    setCustomLeaveDays(days);
    if (leaveFromDate) {
      const d = new Date(leaveFromDate);
      d.setDate(d.getDate() + days - 1);
      setLeaveToDate(d.toISOString().split('T')[0]);
      setSelectedPresetDays(null);
      setIsCustomPresetActive(true);
    }
  };

  const handleF295Toggle = (checked: boolean) => {
    setIncludeF295(checked);
    if (checked && f295Option === 'custom' && f295CustomDays === 0) setF295CustomDays(1);
  };

  const handleF295OptionChange = (opt: '2' | '3' | 'custom', customVal?: number) => {
    setF295Option(opt);
    if (opt === 'custom') setF295CustomDays(customVal ?? Math.max(1, f295CustomDays));
  };

  const calculateLeaveDaysWithF295 = (from: string, to: string, f295: number) => {
    if (!from || !to) return { grossDays: 0, netLeaveDays: 0, f295Days: 0, totalCalendarDays: 0 };
    const f = new Date(from);
    const t = new Date(to);
    const gross = Math.round((t.getTime() - f.getTime()) / (1000 * 3600 * 24)) + 1;
    return {
      grossDays: gross,
      netLeaveDays: Math.max(0, gross - f295),
      f295Days: f295,
      totalCalendarDays: gross
    };
  };

  const modalDaysCalc = useMemo(() => {
    const f295Extra = includeF295 ? (f295Option === '2' ? 2 : f295Option === '3' ? 3 : f295CustomDays) : 0;
    return calculateLeaveDaysWithF295(leaveFromDate, leaveToDate, f295Extra);
  }, [leaveFromDate, leaveToDate, includeF295, f295Option, f295CustomDays]);

  const handleGrantLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveAirmanId || !leaveFromDate || !leaveToDate || leaveFromDate > leaveToDate) {
      alert('Invalid date range or missing information.');
      return;
    }

    setSavingLeave(true);
    setLeaveSuccessMsg('');

    try {
      const fullTypeName = leaveType === 'Casual' ? 'Casual Leave' : leaveType === 'Annual' ? 'Annual Leave' : 'Recreation Leave';
      const f295Extra = includeF295 ? (f295Option === '2' ? 2 : f295Option === '3' ? 3 : f295CustomDays) : 0;
      const notesWithF295 = f295Extra > 0 ? \`\${fullTypeName} (F-295: \${f295Extra} Free Days)\` : fullTypeName;
      
      const res = await fetch('/api/roster/assign-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: leaveAirmanId,
          dutyCode: 'LEAVE',
          fromDate: leaveFromDate,
          toDate: leaveToDate,
          notes: notesWithF295
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setLeaveSuccessMsg('Leave granted successfully!');
        window.dispatchEvent(new CustomEvent('baf_state_updated'));
        setTimeout(() => {
          onSuccess();
        }, 800);
      } else {
        alert(data.error || 'Failed to grant leave');
      }
    } catch (err: any) {
      alert(\`Failed to grant leave: \${err.message}\`);
    } finally {
      setSavingLeave(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-y-auto">
      <div className="p-4 space-y-4">
        {leaveSuccessMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-xl text-center">
            {leaveSuccessMsg}
          </div>
        )}

        <form onSubmit={handleGrantLeaveSubmit} className="space-y-4">
          {/* Flight Filter Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              Flight
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((flt) => {
                const isDisabledFlt = (isAdmin && adminFlight && flt !== adminFlight);
                return (
                  <button
                    key={flt}
                    type="button"
                    onClick={() => !isDisabledFlt && setGrantLeaveFlight(flt)}
                    disabled={isDisabledFlt}
                    className={\`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all \${
                      isDisabledFlt ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700' :
                      grantLeaveFlight === flt
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs cursor-pointer'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 cursor-pointer'
                    }\`}
                  >
                    {flt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Airman */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Select Airman <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">
                {grantAirmenList.length} Airmen available
              </span>
            </div>
            
            <select
              value={leaveAirmanId}
              onChange={(e) => setLeaveAirmanId(e.target.value)}
              className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \${
                !leaveAirmanId
                  ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-700'
              }\`}
              required
            >
              <option value="" disabled>— Select an Airman —</option>
              {grantAirmenList.map((a) => (
                <option key={a.id} value={a.id}>{a.rank} {a.name}</option>
              ))}
            </select>
            {!leaveAirmanId && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                * Please select an airman from the list above
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                From Date
              </label>
              <DateNavigator
                value={leaveFromDate}
                onChange={(e) => {
                  setLeaveFromDate(e.target.value);
                  if (leaveToDate < e.target.value) setLeaveToDate(e.target.value);
                  setSelectedPresetDays(null);
                  setIsCustomPresetActive(false);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                To Date
              </label>
              <DateNavigator
                value={leaveToDate}
                min={leaveFromDate}
                onChange={(e) => {
                  setLeaveToDate(e.target.value);
                  setSelectedPresetDays(null);
                  setIsCustomPresetActive(false);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Duration Presets & Custom Leave Days */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Quick Leave Presets:</span>
              <span className="text-[11px] text-slate-400">Click to Select / Unselect</span>
            </div>
            
            <div className="grid grid-cols-6 gap-1.5">
              {[3, 4, 7, 15, 21, 30].map((days) => {
                const isSelected = selectedPresetDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handlePresetToggle(days)}
                    className={\`py-1.5 px-1 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs text-center border \${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/50 shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300'
                    }\`}
                  >
                    {days} Days
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-slate-700/60 p-2 rounded-xl border border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Custom Leave:
                </span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={customLeaveDays}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      handleCustomLeaveDaysChange(val);
                    }}
                    className="w-16 px-2 py-1 text-xs font-black text-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">Days</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCustomLeaveDaysChange(customLeaveDays)}
                className={\`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer \${
                  isCustomPresetActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
                }\`}
              >
                {isCustomPresetActive ? '✓ Custom Set' : 'Apply Custom'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeF295}
                    onChange={(e) => handleF295Toggle(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                    F-295
                  </span>
                </label>
                {includeF295 && (
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                    +{f295Option === '2' ? '2' : f295Option === '3' ? '3' : f295CustomDays} Days Added (Free Leave)
                  </span>
                )}
              </div>

              {includeF295 && (
                <div className="flex flex-wrap items-center gap-2 pl-6 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => handleF295OptionChange('2')}
                    className={\`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer \${
                      f295Option === '2'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                    }\`}
                  >
                    2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleF295OptionChange('3')}
                    className={\`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer \${
                      f295Option === '3'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                    }\`}
                  >
                    3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleF295OptionChange('custom')}
                    className={\`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer \${
                      f295Option === 'custom'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                    }\`}
                  >
                    Custom
                  </button>
                  {f295Option === 'custom' && (
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={f295CustomDays}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setF295CustomDays(val);
                          handleF295OptionChange('custom', val);
                        }}
                        className="w-14 px-2 py-0.5 text-xs font-bold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none"
                      />
                      <span className="text-[11px] text-slate-500">Days</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Leave Type Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Leave Type
              </label>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Duration: {leaveDurationDays} Day{leaveDurationDays > 1 ? 's' : ''}
              </span>
            </div>

            {leaveDurationDays <= 10 ? (
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-black text-xs">
                    Casual Leave
                  </span>
                  <span className="text-xs text-sky-800 dark:text-sky-300 font-semibold">
                    Auto-selected (≤ 10 days)
                  </span>
                </div>
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400">
                  Casual
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType('Annual')}
                    className={\`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer \${
                      leaveType === 'Annual'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }\`}
                  >
                    Annual Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('Recreation')}
                    className={\`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer \${
                      leaveType === 'Recreation'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }\`}
                  >
                    Recreation Leave
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  Duration is > 10 days: select either Annual Leave or Recreation Leave.
                </p>
              </div>
            )}
          </div>

          {/* Real-time duration & Military F-295 summary badge */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
              <span>Net Leave Balance Count:</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                {modalDaysCalc.netLeaveDays} Day{modalDaysCalc.netLeaveDays > 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between border-t border-emerald-200/60 dark:border-emerald-800/60 pt-1.5">
              <span>Total Calendar Span: <strong>{modalDaysCalc.totalCalendarDays} Days</strong></span>
              {modalDaysCalc.f295Days > 0 ? (
                <span className="font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-900/60 px-2 py-0.5 rounded-md">
                  F-295 (Free Leave): {modalDaysCalc.f295Days} Day(s)
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">No F-295 free days (F-295: 0)</span>
              )}
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
  );
};
`;

fs.writeFileSync(tabFile, output);
console.log('Saved AssignLeaveTab.tsx');
