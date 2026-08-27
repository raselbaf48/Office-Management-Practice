import React, { useState } from 'react';
import { FlightName, DutyCategoryCode, IDAShift } from '../types';
import {
  DutyRatioTable,
  getStoredDutyMatrix,
  saveDutyMatrix,
  resetDutyMatrixToDefault,
  parseDayNumber,
} from '../data/officialDutyRatioMatrix';
import { X, Check, RefreshCw, Sliders, Info, Sun, Moon, Sunset } from 'lucide-react';

interface FlightDutyRatioModalProps {
  date: string;
  onClose: () => void;
  onRatiosUpdated?: () => void;
}

interface DutyRatioItemConfig {
  tableId: string;
  title: string;
  dutyCode: DutyCategoryCode;
  shiftLabel?: IDAShift;
  badgeBg: string;
  badgeText: string;
  shortName: string;
  description: string;
}

const CONFIGURABLE_DUTY_ITEMS: DutyRatioItemConfig[] = [
  {
    tableId: 'security_duty',
    title: 'Security Duty (GD)',
    dutyCode: 'GD',
    badgeBg: 'bg-blue-100 dark:bg-blue-950',
    badgeText: 'text-blue-700 dark:text-blue-300',
    shortName: 'GD',
    description: 'Base Security Guard Duty',
  },
  {
    tableId: 'nazirpara_tf',
    title: 'Nazirpara Taskforce (NTF)',
    dutyCode: 'NTF',
    badgeBg: 'bg-amber-100 dark:bg-amber-950',
    badgeText: 'text-amber-700 dark:text-amber-300',
    shortName: 'NTF',
    description: 'Najirpara Taskforce Patrol',
  },
  {
    tableId: 'base_tf',
    title: 'Base Taskforce (BTF)',
    dutyCode: 'BTF',
    badgeBg: 'bg-sky-100 dark:bg-sky-950',
    badgeText: 'text-sky-700 dark:text-sky-300',
    shortName: 'BTF',
    description: 'Base Taskforce Guard & Escort',
  },
  {
    tableId: 'idac_mor',
    title: 'IDAC Morning Shift',
    dutyCode: 'IDAC',
    shiftLabel: 'Morning',
    badgeBg: 'bg-yellow-100 dark:bg-yellow-950',
    badgeText: 'text-yellow-800 dark:text-yellow-300',
    shortName: 'IDAC-MOR',
    description: 'IDA Center (Morning Duty)',
  },
  {
    tableId: 'idac_an',
    title: 'IDAC Afternoon Shift',
    dutyCode: 'IDAC',
    shiftLabel: 'Afternoon',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950',
    badgeText: 'text-emerald-800 dark:text-emerald-300',
    shortName: 'IDAC-A/N',
    description: 'IDA Center (Afternoon Duty)',
  },
  {
    tableId: 'idac_nt',
    title: 'IDAC Night Shift',
    dutyCode: 'IDAC',
    shiftLabel: 'Night',
    badgeBg: 'bg-red-100 dark:bg-red-950',
    badgeText: 'text-red-800 dark:text-red-300',
    shortName: 'IDAC-NT',
    description: 'IDA Center (Night Duty - 2 per night)',
  },
  {
    tableId: 'airport_duty',
    title: 'Airport Duty',
    dutyCode: 'AIRPORT',
    badgeBg: 'bg-purple-100 dark:bg-purple-950',
    badgeText: 'text-purple-700 dark:text-purple-300',
    shortName: 'APT',
    description: 'Airfield / Airport Security & Operations',
  },
  {
    tableId: 'halishahar_duty',
    title: 'Halishahar Duty',
    dutyCode: 'HALISHAHAR',
    badgeBg: 'bg-teal-100 dark:bg-teal-950',
    badgeText: 'text-teal-700 dark:text-teal-300',
    shortName: 'HLSH',
    description: 'Halishahar Taskforce Unit',
  },
];

export const FlightDutyRatioModal: React.FC<FlightDutyRatioModalProps> = ({
  date,
  onClose,
  onRatiosUpdated,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(date || new Date().toISOString().split('T')[0]);
  const [matrix, setMatrix] = useState<DutyRatioTable[]>(() => getStoredDutyMatrix());
  const [activeTabFlight, setActiveTabFlight] = useState<FlightName>('Mechanics');
  const [savedMsg, setSavedMsg] = useState<string>('');

  const dayNum = parseDayNumber(selectedDate || date);
  const dayIndex = Math.max(0, Math.min(30, dayNum - 1));

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate || date);
  };

  const getQuotaForTable = (tableId: string, flight: FlightName): number => {
    const table = matrix.find((t) => t.id === tableId);
    if (!table || !table.data[flight]) return 0;
    return table.data[flight][dayIndex] || 0;
  };

  const setQuotaForTable = (tableId: string, flight: FlightName, count: number) => {
    const val = Math.max(0, count);
    const updated = matrix.map((t) => {
      if (t.id === tableId) {
        const flightData = { ...t.data };
        const arr = [...(flightData[flight] || new Array(31).fill(0))];
        arr[dayIndex] = val;
        flightData[flight] = arr;
        return { ...t, data: flightData };
      }
      return t;
    });
    setMatrix(updated);
  };

  const handleSave = () => {
    saveDutyMatrix(matrix);
    // Clear legacy date override cache so matrix is single source of truth
    try {
      localStorage.removeItem(`baf_flight_duty_ratios_v1_${selectedDate}`);
    } catch {}
    setSavedMsg(`✅ Flight duty ratios saved for ${selectedDate}!`);
    if (onRatiosUpdated) onRatiosUpdated();
    setTimeout(() => {
      setSavedMsg('');
      onClose();
    }, 600);
  };

  const handleResetDefault = () => {
    const def = resetDutyMatrixToDefault();
    setMatrix(def);
    try {
      localStorage.removeItem(`baf_flight_duty_ratios_v1_${selectedDate}`);
    } catch {}
    setSavedMsg(`Reset to official default template for ${selectedDate}!`);
    if (onRatiosUpdated) onRatiosUpdated();
  };

  const flights: FlightName[] = ['Mechanics', 'Avionics', 'GCS', 'Admin'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Configure Flight Duty Ratios / Quotas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set required duty counts & IDAC shifts (Morning / Afternoon / Night) for each flight on this date.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedMsg && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-bold animate-fadeIn">
            {savedMsg}
          </div>
        )}

        {/* Date Selector */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Date:</span>
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60">
              Day {dayNum} of Month
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Default Template</span>
          </button>
        </div>

        {/* Flight Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {flights.map((fl) => {
            const isSelected = activeTabFlight === fl;
            const flightTotal = CONFIGURABLE_DUTY_ITEMS.reduce((sum, item) => {
              return sum + getQuotaForTable(item.tableId, fl);
            }, 0);

            return (
              <button
                key={fl}
                type="button"
                onClick={() => setActiveTabFlight(fl)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                  isSelected
                    ? fl === 'Mechanics'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                      : fl === 'Avionics'
                      ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm'
                      : fl === 'GCS'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                      : 'bg-slate-700 text-white border-slate-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{fl} Flt</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {flightTotal} No.
                </span>
              </button>
            );
          })}
        </div>

        {/* Duty Quotas Grid for Active Flight */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between px-1">
            <span>Duty Category / Shift</span>
            <span>Required Ratio / Count</span>
          </div>

          {CONFIGURABLE_DUTY_ITEMS.map((item) => {
            const currentVal = getQuotaForTable(item.tableId, activeTabFlight);
            return (
              <div
                key={item.tableId}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                  currentVal > 0
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${item.badgeBg} ${item.badgeText}`}>
                    {item.shortName}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <span>{item.title}</span>
                      {item.shiftLabel === 'Morning' && <Sun className="w-3.5 h-3.5 text-yellow-500" />}
                      {item.shiftLabel === 'Afternoon' && <Sunset className="w-3.5 h-3.5 text-emerald-500" />}
                      {item.shiftLabel === 'Night' && <Moon className="w-3.5 h-3.5 text-red-500" />}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[260px]">
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setQuotaForTable(item.tableId, activeTabFlight, currentVal - 1)}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-black text-sm flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-slate-100">
                    {currentVal} No.
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuotaForTable(item.tableId, activeTabFlight, currentVal + 1)}
                    className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start space-x-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong>Dynamic Shift & Quota Rule:</strong> Saving this ratio immediately updates the Assign Duty shift options (e.g. if only Afternoon is selected for Mechanics on this date, only Afternoon will appear in the shift picker).
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Ratio Config</span>
          </button>
        </div>
      </div>
    </div>
  );
};
