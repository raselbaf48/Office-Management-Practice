import React, { useState, useEffect } from 'react';
import {
  DutyRatioTable,
  getStoredDutyMatrix,
  saveDutyMatrix,
  resetDutyMatrixToDefault,
} from '../data/officialDutyRatioMatrix';
import { FlightName, UserRole } from '../types';
import {
  Save,
  RotateCcw,
  Check,
  Info,
  Shield,
  Layers,
  Printer,
  Search,
  Sparkles,
  Sliders,
  Calendar,
  Lock,
  Eye,
  FileDown,
} from 'lucide-react';
import { exportDutyRatioDocx } from '../utils/docxExport';

interface DutyRatioMatrixViewProps {
  role?: UserRole;
  onRequestAdminAccess?: () => void;
}

export const DutyRatioMatrixView: React.FC<DutyRatioMatrixViewProps> = ({
  role = 'ADMIN',
  onRequestAdminAccess,
}) => {
  const [matrix, setMatrix] = useState<DutyRatioTable[]>(() => getStoredDutyMatrix());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [selectedFlightFilter, setSelectedFlightFilter] = useState<FlightName | 'All'>('All');

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);
  const flights: FlightName[] = ['Mechanics', 'Avionics', 'GCS', 'Admin'];

  // Flight name short codes
  const flightShortMap: Record<FlightName, string> = {
    Mechanics: 'Mech',
    Avionics: 'AVI',
    GCS: 'GCS',
    Admin: 'Admin',
  };

  // Color schemes for each table matching official sheet colors
  const tableColorMap: Record<string, { header: string; badge: string; border: string }> = {
    security_duty: {
      header: 'bg-blue-700 text-white dark:bg-blue-900',
      badge: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
      border: 'border-blue-300 dark:border-blue-800',
    },
    nazirpara_tf: {
      header: 'bg-amber-500 text-slate-950 font-black dark:bg-amber-600',
      badge: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
      border: 'border-amber-300 dark:border-amber-800',
    },
    base_tf: {
      header: 'bg-sky-800 text-white dark:bg-sky-950',
      badge: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200',
      border: 'border-sky-300 dark:border-sky-800',
    },
    idac_mor: {
      header: 'bg-yellow-400 text-slate-950 font-black dark:bg-yellow-500',
      badge: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200',
      border: 'border-yellow-300 dark:border-yellow-700',
    },
    idac_an: {
      header: 'bg-emerald-600 text-white dark:bg-emerald-800',
      badge: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
      border: 'border-emerald-300 dark:border-emerald-800',
    },
    idac_nt: {
      header: 'bg-red-600 text-white dark:bg-red-800',
      badge: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
      border: 'border-red-300 dark:border-red-800',
    },
    airport_duty: {
      header: 'bg-purple-700 text-white dark:bg-purple-900',
      badge: 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200',
      border: 'border-purple-300 dark:border-purple-800',
    },
    halishahar_duty: {
      header: 'bg-teal-700 text-white dark:bg-teal-900',
      badge: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200',
      border: 'border-teal-300 dark:border-teal-800',
    },
  };

  const handleCellChange = (
    tableIndex: number,
    flight: FlightName,
    dayIndex: number,
    valStr: string
  ) => {
    const num = Math.max(0, parseInt(valStr, 10) || 0);
    const updated = [...matrix];
    const tableObj = { ...updated[tableIndex] };
    const flightData = { ...tableObj.data };
    const arr = [...flightData[flight]];
    arr[dayIndex] = num;
    flightData[flight] = arr;
    tableObj.data = flightData;
    updated[tableIndex] = tableObj;
    setMatrix(updated);
    setIsSaved(false);
  };

  const handleSave = () => {
    saveDutyMatrix(matrix);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all duty ratios to the official BAF 155 UASU default template?')) {
      const def = resetDutyMatrixToDefault();
      setMatrix(def);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  // Grand totals calculation
  const totalSlotsOverall = matrix.reduce((grandSum, table) => {
    return (
      grandSum +
      flights.reduce((fSum, fl) => {
        return fSum + table.data[fl].reduce((dSum, count) => dSum + count, 0);
      }, 0)
    );
  }, 0);

  const flightTotalsOverall: Record<FlightName, number> = {
    Mechanics: 0,
    Avionics: 0,
    GCS: 0,
    Admin: 0,
  };

  matrix.forEach((table) => {
    flights.forEach((fl) => {
      flightTotalsOverall[fl] += table.data[fl].reduce((s, c) => s + c, 0);
    });
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                155 UASU BAF • Monthly Duty Ratio Matrix
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                Official Roster Scale
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured daily quota matrix for Security Duty, Nazirpara T/F, Base T/F, and IDAC Shifts (Days 1–31).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => exportDutyRatioDocx(matrix)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Download Duty Ratio Matrix as Document"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Document</span>
          </button>

          {role === 'ADMIN' ? (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1.5"
                title="Reset to official BAF template"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset BAF Template</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Saved Successfully!' : 'Save Duty Ratios'}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
                <Eye className="w-3.5 h-3.5" />
                <span>Read-Only Scale</span>
              </div>
              {onRequestAdminAccess && (
                <button
                  type="button"
                  onClick={onRequestAdminAccess}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-xs transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Unlock</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Airman Read-Only Notice */}
      {role !== 'ADMIN' && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Airman View Active:</strong> The official ratio quotas are displayed in read-only mode. All search and flight filters are active.
            </span>
          </div>
          <span className="font-semibold text-[11px] text-blue-700 dark:text-blue-300 hidden sm:inline">
            Admin Passcode: 1124
          </span>
        </div>
      )}

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl shadow-md border border-indigo-800/80">
          <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
            Total Monthly Slots
          </div>
          <div className="text-2xl font-black mt-1">{totalSlotsOverall} <span className="text-xs font-normal text-indigo-200">Personnel</span></div>
          <div className="text-[10px] text-indigo-300/80 mt-0.5">Scale 155 UASU BAF</div>
        </div>

        {flights.map((fl) => (
          <div
            key={fl}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>{fl} Flight</span>
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-700 dark:text-slate-300">
                {flightShortMap[fl]}
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {flightTotalsOverall[fl]} <span className="text-xs font-semibold text-slate-400">Duties</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Monthly Total</div>
          </div>
        ))}
      </div>

      {/* Controls & Flight Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search duty category..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 w-full sm:w-60"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 mr-1">Flight:</span>
          {(['All', ...flights] as const).map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => setSelectedFlightFilter(fl)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                selectedFlightFilter === fl
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {fl}
            </button>
          ))}
        </div>
      </div>

      {/* Tables List */}
      <div className="space-y-6">
        {matrix
          .filter((t) => t.title.toLowerCase().includes(filterQuery.toLowerCase()))
          .map((tableObj, tableIdx) => {
            const colors = tableColorMap[tableObj.id] || {
              header: 'bg-slate-800 text-white',
              badge: 'bg-slate-100 text-slate-900',
              border: 'border-slate-300',
            };

            const displayFlights =
              selectedFlightFilter === 'All'
                ? flights
                : flights.filter((f) => f === selectedFlightFilter);

            // Compute column sums (daily total)
            const dailyTotals = daysArray.map((_, dayIdx) => {
              return flights.reduce((sum, fl) => sum + (tableObj.data[fl]?.[dayIdx] || 0), 0);
            });

            // Table monthly sum
            const tableMonthlyTotal = flights.reduce((sum, fl) => {
              return sum + (tableObj.data[fl]?.reduce((dSum, c) => dSum + c, 0) || 0);
            }, 0);

            return (
              <div
                key={tableObj.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${colors.border} shadow-lg overflow-hidden transition-all`}
              >
                {/* Table Header Banner */}
                <div className={`px-4 py-3 flex items-center justify-between ${colors.header}`}>
                  <div className="flex items-center space-x-2.5">
                    <Shield className="w-5 h-5 shrink-0" />
                    <span className="font-black text-sm uppercase tracking-wide">
                      {tableObj.title}
                    </span>
                    {tableObj.shiftLabel && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/20 text-white">
                        {tableObj.shiftLabel} Shift
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold">
                    Monthly Quota: <span className="text-sm font-black underline">{tableMonthlyTotal} No.</span>
                  </div>
                </div>

                {/* Table Responsive Scroll Matrix */}
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  <table className="w-full text-center border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2 px-3 text-left w-24 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">
                          Flight / Date
                        </th>
                        {daysArray.map((dayNum) => (
                          <th
                            key={dayNum}
                            className="py-1.5 px-1 min-w-[32px] border-r border-slate-200 dark:border-slate-800 font-mono text-[11px]"
                          >
                            {dayNum}
                          </th>
                        ))}
                        <th className="py-2 px-2 min-w-[50px] font-black bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-800 dark:text-slate-200">
                      {displayFlights.map((fl) => {
                        const flightRowArr = tableObj.data[fl] || [];
                        const rowSum = flightRowArr.reduce((s, c) => s + c, 0);

                        return (
                          <tr key={fl} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                            {/* Flight Label Sticky */}
                            <td className="py-1.5 px-3 text-left font-bold bg-slate-50 dark:bg-slate-900 sticky left-0 border-r border-slate-200 dark:border-slate-800 z-10 text-slate-900 dark:text-slate-100">
                              {flightShortMap[fl]}
                            </td>

                            {/* 31 Days Inputs */}
                            {daysArray.map((_, dayIdx) => {
                              const currentVal = flightRowArr[dayIdx] || 0;
                              return (
                                <td
                                  key={dayIdx}
                                  className={`p-0 border-r border-slate-200 dark:border-slate-800 ${
                                    currentVal > 0
                                      ? 'bg-amber-500/10 dark:bg-amber-500/20 font-black text-amber-900 dark:text-amber-200'
                                      : 'text-slate-400 dark:text-slate-600'
                                  }`}
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    max="9"
                                    readOnly={role !== 'ADMIN'}
                                    value={currentVal === 0 ? '' : currentVal}
                                    placeholder="0"
                                    onChange={(e) =>
                                      handleCellChange(tableIdx, fl, dayIdx, e.target.value)
                                    }
                                    className={`w-full h-8 text-center bg-transparent text-xs font-mono font-bold outline-none transition-colors ${
                                      role === 'ADMIN' ? 'focus:bg-indigo-100 dark:focus:bg-indigo-950/80 cursor-pointer' : 'cursor-default'
                                    } ${
                                      currentVal > 0 ? 'font-black text-slate-900 dark:text-amber-300' : 'text-slate-300 dark:text-slate-700'
                                    }`}
                                  />
                                </td>
                              );
                            })}

                            {/* Flight Row Total */}
                            <td className="py-1.5 px-2 font-black bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-center font-mono">
                              {rowSum}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Column Daily Totals Row */}
                      <tr className="bg-slate-200/80 dark:bg-slate-800 font-black text-slate-900 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700">
                        <td className="py-2 px-3 text-left uppercase text-[10px] tracking-wider sticky left-0 bg-slate-200 dark:bg-slate-800 z-10 border-r border-slate-300 dark:border-slate-700">
                          Daily Total
                        </td>
                        {dailyTotals.map((colSum, dayIdx) => (
                          <td
                            key={dayIdx}
                            className="py-1.5 px-1 font-mono text-[11px] border-r border-slate-300 dark:border-slate-700"
                          >
                            {colSum}
                          </td>
                        ))}
                        <td className="py-2 px-2 text-center text-sm font-black bg-slate-300 dark:bg-slate-700 text-indigo-950 dark:text-indigo-200">
                          {tableMonthlyTotal}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
