import React, { useState } from 'react';
import { FlightName, DutyCategoryCode } from '../types';
import { DUTY_TYPES } from '../data/dutyTypes';
import {
  FlightDutyQuota,
  getStoredDutyRatiosForDate,
  saveDutyRatiosForDate,
  DEFAULT_FLIGHT_DUTY_RATIOS,
} from '../data/dutyRatios';
import { X, Check, RefreshCw, Sliders, Info } from 'lucide-react';

interface FlightDutyRatioModalProps {
  date: string;
  onClose: () => void;
  onRatiosUpdated?: () => void;
}

export const FlightDutyRatioModal: React.FC<FlightDutyRatioModalProps> = ({
  date,
  onClose,
  onRatiosUpdated,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(date);
  const [ratios, setRatios] = useState<FlightDutyQuota[]>(() =>
    getStoredDutyRatiosForDate(date)
  );
  const [activeTabFlight, setActiveTabFlight] = useState<FlightName>('Avionics');
  const [savedMsg, setSavedMsg] = useState<string>('');

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setRatios(getStoredDutyRatiosForDate(newDate));
  };

  const getQuotaFor = (flight: FlightName, dutyCode: DutyCategoryCode): number => {
    const found = ratios.find((r) => r.flight === flight && r.dutyCode === dutyCode);
    return found ? found.requiredCount : 0;
  };

  const setQuotaFor = (flight: FlightName, dutyCode: DutyCategoryCode, count: number) => {
    const val = Math.max(0, count);
    const existingIndex = ratios.findIndex((r) => r.flight === flight && r.dutyCode === dutyCode);
    let updated = [...ratios];
    if (existingIndex >= 0) {
      if (val === 0) {
        updated.splice(existingIndex, 1);
      } else {
        updated[existingIndex] = { ...updated[existingIndex], requiredCount: val };
      }
    } else if (val > 0) {
      updated.push({ flight, dutyCode, requiredCount: val });
    }
    setRatios(updated);
  };

  const handleSave = () => {
    saveDutyRatiosForDate(selectedDate, ratios);
    setSavedMsg(`✅ Flight duty ratios saved for ${selectedDate}!`);
    if (onRatiosUpdated) onRatiosUpdated();
    setTimeout(() => {
      setSavedMsg('');
      onClose();
    }, 1000);
  };

  const handleResetDefault = () => {
    setRatios(DEFAULT_FLIGHT_DUTY_RATIOS);
    saveDutyRatiosForDate(selectedDate, DEFAULT_FLIGHT_DUTY_RATIOS);
    setSavedMsg(`Reset to default ratios for ${selectedDate}!`);
    if (onRatiosUpdated) onRatiosUpdated();
  };

  const flights: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];

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
                Set required duty counts (e.g. 1 No. Security Duty) for each flight.
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
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Default Ratios</span>
          </button>
        </div>

        {/* Flight Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {flights.map((fl) => {
            const isSelected = activeTabFlight === fl;
            const flightTotal = ratios
              .filter((r) => r.flight === fl)
              .reduce((sum, r) => sum + r.requiredCount, 0);

            return (
              <button
                key={fl}
                type="button"
                onClick={() => setActiveTabFlight(fl)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
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
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <div className="text-xs font-bold text-slate-500 flex items-center justify-between px-1">
            <span>Duty Category</span>
            <span>Required Ratio / Count</span>
          </div>

          {DUTY_TYPES.filter((dt) => dt.code !== 'ON_PARADE').map((dt) => {
            const currentVal = getQuotaFor(activeTabFlight, dt.code);
            return (
              <div
                key={dt.code}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                  currentVal > 0
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${dt.badgeBg} ${dt.badgeText}`}>
                    {dt.shortName}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {dt.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[240px]">
                      {dt.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setQuotaFor(activeTabFlight, dt.code, currentVal - 1)}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-black text-sm flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-slate-100">
                    {currentVal} No.
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuotaFor(activeTabFlight, dt.code, currentVal + 1)}
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
            <strong>Duty Ratio Rule:</strong> When assigning duties, selecting a Flight will automatically display the required counts (e.g. 1 No.) and make only those required duties visible for assignment.
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
