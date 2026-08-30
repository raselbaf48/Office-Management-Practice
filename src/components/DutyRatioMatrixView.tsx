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
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { exportDutyRatioDocx } from '../utils/docxExport';
import { ImportDutyRatioModal } from './ImportDutyRatioModal';

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
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

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

  const handleImportRatioComplete = (newMatrix: DutyRatioTable[]) => {
    setMatrix(newMatrix);
    saveDutyMatrix(newMatrix);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
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
                155 UASU BAF • Duty Ratio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                Official Roster Scale
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured daily quota ratio for Security Duty, Nazirpara T/F, Base T/F, and IDAC Shifts (Days 1–31).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => exportDutyRatioDocx(matrix)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Download Duty Ratio as Document"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Document</span>
          </button>

          {role === 'ADMIN' ? (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                title="Import Duty Ratio from CSV or Excel file"
              >
                <Upload className="w-4 h-4" />
                <span>Import Ratio</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Reset to official BAF template"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset BAF Template</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
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
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-xs transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Unlock</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Airman Read-Only Notice - Admin passcode removed for security */}
      {role !== 'ADMIN' && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl p-3.5 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Airman View Active:</strong> The official ratio quotas are displayed in read-only mode. All search and flight filters are active.
            </span>
          </div>
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
              <span className="font-mono text-emerald-600 font-bold">{flightShortMap[fl]}</span>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {flightTotalsOverall[fl]}
              <span className="text-xs font-normal text-slate-500 ml-1">slots/mo</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${totalSlotsOverall > 0 ? (flightTotalsOverall[fl] / totalSlotsOverall) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search duty table name..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Flight:</span>
          {(['All', ...flights] as (FlightName | 'All')[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFlightFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedFlightFilter === f
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ratio Tables Grid */}
      <div className="space-y-6">
        {matrix
          .filter((t) =>
            t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(filterQuery.toLowerCase())
          )
          .map((table, tableIdx) => {
            const colors = tableColorMap[table.id] || {
              header: 'bg-slate-800 text-white',
              badge: 'bg-slate-100 text-slate-900',
              border: 'border-slate-300',
            };

            const tableTotal = flights.reduce((sum, fl) => {
              return sum + table.data[fl].reduce((s, c) => s + c, 0);
            }, 0);

            return (
              <div
                key={table.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden"
              >
                {/* Table Header Bar */}
                <div className={`px-4 py-3 flex items-center justify-between ${colors.header}`}>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-black text-sm tracking-wider">
                      {tableIdx + 1}. {table.title}
                    </span>
                    <span className="text-[11px] opacity-85 px-2 py-0.5 rounded-md bg-black/20 font-bold">
                      Code: {table.dutyCode}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                      Month Total: <strong className="font-mono">{tableTotal}</strong>
                    </span>
                  </div>
                </div>

                {/* Table Body (Days 1 to 31) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                        <th className="p-2 text-left sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 w-28 min-w-28 border-r border-slate-200 dark:border-slate-700">
                          Flight
                        </th>
                        {daysArray.map((d) => (
                          <th key={d} className="p-1 min-w-[28px] max-w-[32px] font-mono text-[11px]">
                            {d}
                          </th>
                        ))}
                        <th className="p-2 w-16 min-w-16 font-bold bg-slate-200/60 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {flights
                        .filter((fl) => selectedFlightFilter === 'All' || selectedFlightFilter === fl)
                        .map((flight) => {
                          const rowSum = table.data[flight].reduce((a, b) => a + b, 0);

                          return (
                            <tr
                              key={flight}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="p-2 text-left font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                  <span>{flight}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {flightShortMap[flight]}
                                  </span>
                                </div>
                              </td>

                              {daysArray.map((dayNum, dayIdx) => {
                                const val = table.data[flight][dayIdx] || 0;
                                const isPositive = val > 0;

                                return (
                                  <td
                                    key={dayNum}
                                    className={`p-0.5 border border-slate-100 dark:border-slate-800/50 ${
                                      isPositive
                                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-black'
                                        : 'text-slate-400 dark:text-slate-600 font-normal'
                                    }`}
                                  >
                                    {role === 'ADMIN' ? (
                                      <input
                                        type="number"
                                        min={0}
                                        max={9}
                                        value={val}
                                        onChange={(e) =>
                                          handleCellChange(tableIdx, flight, dayIdx, e.target.value)
                                        }
                                        className={`w-full text-center py-1 font-mono text-xs rounded-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                                          isPositive
                                            ? 'bg-emerald-100/70 dark:bg-emerald-900/60 font-bold'
                                            : 'bg-transparent text-slate-400'
                                        }`}
                                      />
                                    ) : (
                                      <span className="inline-block py-1 font-mono text-xs">{val}</span>
                                    )}
                                  </td>
                                );
                              })}

                              <td className="p-2 font-mono font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700">
                                {rowSum}
                              </td>
                            </tr>
                          );
                        })}

                      {/* Daily Total Row (Sum across all flights for each day) */}
                      <tr className="bg-slate-100/90 dark:bg-slate-800/90 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                        <td className="p-2 text-left font-black sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 border-r border-slate-300 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="uppercase text-[11px] font-black tracking-wider text-slate-800 dark:text-slate-200">
                              Daily Total
                            </span>
                            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono font-bold">
                              TOTAL
                            </span>
                          </div>
                        </td>

                        {daysArray.map((dayNum, dayIdx) => {
                          const dailySum = flights.reduce(
                            (sum, fl) => sum + (table.data[fl]?.[dayIdx] || 0),
                            0
                          );
                          const isPositive = dailySum > 0;

                          return (
                            <td
                              key={dayNum}
                              className={`p-0.5 border border-slate-200 dark:border-slate-700/70 font-mono font-black ${
                                isPositive
                                  ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200'
                                  : 'text-slate-400 dark:text-slate-600 font-normal'
                              }`}
                            >
                              <span className="inline-block py-1 text-xs">{dailySum}</span>
                            </td>
                          );
                        })}

                        <td className="p-2 font-mono font-black text-emerald-800 dark:text-emerald-300 bg-slate-200/90 dark:bg-slate-700/90 border-l border-slate-300 dark:border-slate-700 text-xs">
                          {tableTotal}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
      </div>

      {/* Import Ratio Modal */}
      <ImportDutyRatioModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentMatrix={matrix}
        onImport={handleImportRatioComplete}
      />
    </div>
  );
};
