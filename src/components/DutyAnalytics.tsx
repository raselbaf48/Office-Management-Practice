import React, { useState, useEffect } from 'react';
import { Airman, AirmanDutyStats, ConflictAlert, FlightName } from '../types';
import { DUTY_TYPES, DUTY_TYPE_MAP } from '../data/dutyTypes';
import { BarChart3, ShieldCheck, AlertCircle, Award, Scale, Layers, RefreshCw, Calendar } from 'lucide-react';
import { sortAirmenBySeniority } from '../utils/seniority';

interface DutyAnalyticsProps {
  airmen: Airman[];
  onViewProfile: (airman: Airman) => void;
}

export const DutyAnalytics: React.FC<DutyAnalyticsProps> = ({ airmen, onViewProfile }) => {
  const today = new Date();
  const [monthKey, setMonthKey] = useState<string>(
    `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`
  );

  const [stats, setStats] = useState<AirmanDutyStats[]>([]);
  const [alerts, setAlerts] = useState<ConflictAlert[]>([]);
  const [totals, setTotals] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?month=${monthKey}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.airmanStats || []);
        setAlerts(data.conflictAlerts || []);
        setTotals(data.totals || {});
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const handleGlobalUpdate = () => {
      fetchAnalytics();
    };
    window.addEventListener('baf_state_updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('baf_state_updated', handleGlobalUpdate);
    };
  }, [monthKey]);

  // Airman map for fast access
  const airmanMap = new Map(airmen.map((a) => [a.id, a]));

  // Helper to calculate Duty Load EXCLUDING Airfield Duty (as per military regulation)
  const getDutyCountExcludingAirfield = (s: AirmanDutyStats) => {
    return (
      (s.totalGD || 0) +
      (s.totalBTF || 0) +
      (s.totalNTF || 0) +
      (s.totalHalishahar || 0) +
      (s.totalIDAC || 0)
    );
  };

  // Sorted list for Duty Equity (Excluding Airfield Duty)
  const sortedByDutyCount = [...stats].sort(
    (a, b) => getDutyCountExcludingAirfield(b) - getDutyCountExcludingAirfield(a)
  );
  const highestDuties = sortedByDutyCount.slice(0, 5);
  const lowestDuties = [...sortedByDutyCount].reverse().slice(0, 5);

  // Flight-wise Duty Total calculations with full names
  const flights: FlightName[] = ['Avionics', 'Mechanics', 'GCS', 'Admin'];
  const flightDuties = flights.map((fl) => {
    const flStats = stats.filter((s) => s.flightName === fl);
    const totalGD = flStats.reduce((acc, s) => acc + (s.totalGD || 0), 0);
    const totalBTF = flStats.reduce((acc, s) => acc + (s.totalBTF || 0), 0);
    const totalNTF = flStats.reduce((acc, s) => acc + (s.totalNTF || 0), 0);
    const totalHalishahar = flStats.reduce((acc, s) => acc + (s.totalHalishahar || 0), 0);
    const totalAirport = flStats.reduce((acc, s) => acc + (s.totalAirport || 0), 0);
    const totalIDAC = flStats.reduce((acc, s) => acc + (s.totalIDAC || 0), 0);
    const totalAll = flStats.reduce((acc, s) => acc + s.totalDutyCount, 0);

    return {
      flightName: fl,
      totalGD,
      totalBTF,
      totalNTF,
      totalHalishahar,
      totalAirport,
      totalIDAC,
      totalAll,
      airmenCount: flStats.length,
      avgPerAirman: flStats.length ? (totalAll / flStats.length).toFixed(1) : '0',
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Duty Analysis & Fairness Equity Monitor</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Workload distribution, duty posts, and flight comparisons for 155 UASU BAF
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-medium">Month:</span>
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setMonthKey(e.target.value)}
            className="bg-transparent font-black outline-none text-slate-900 dark:text-slate-100 cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <p className="text-xs font-bold">Calculating Duty Analytics...</p>
        </div>
      ) : (
        <>
          {/* Overview Cards (Full names for all duties) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider block">
                Base Security Duty
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totals.totalGD || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-400">GD</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                Base Taskforce Duty
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totals.totalBTF || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-400">BTF</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/60 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                Najirpara Taskforce
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {totals.totalNTF || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-400">NTF</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                Halishahar Taskforce
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {stats.reduce((a, b) => a + (b.totalHalishahar || 0), 0)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">HTF</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-900/60 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                Airfield Duty
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {stats.reduce((a, b) => a + (b.totalAirport || 0), 0)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">Airfield</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-2xl p-3.5 shadow-xs">
              <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                IDAC Duty
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {stats.reduce((a, b) => a + (b.totalIDAC || 0), 0)}
                </span>
                <span className="text-[10px] font-bold text-slate-400">IDAC</span>
              </div>
            </div>
          </div>

          {/* Flight Workload Equity Comparison (Full Form Names) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Flight-wise Duty Distribution & Average Workload</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Duty counters per flight with full names (Base Security, Base Taskforce, Airfield, Halishahar, IDAC)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {flightDuties.map((fl) => (
                <div
                  key={fl.flightName}
                  className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                      {fl.flightName} Flight
                    </span>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Avg: {fl.avgPerAirman} / Airman
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] font-medium">Base Security Duty:</span>
                      <span className="font-mono font-black text-red-600 dark:text-red-400">{fl.totalGD}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] font-medium">Base Taskforce Duty:</span>
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400">{fl.totalBTF}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] font-medium">Najirpara Taskforce:</span>
                      <span className="font-mono font-black text-orange-600 dark:text-orange-400">{fl.totalNTF}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] font-medium">Halishahar Taskforce:</span>
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400">{fl.totalHalishahar}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] font-medium">Airfield Duty:</span>
                      <span className="font-mono font-black text-cyan-600 dark:text-cyan-400">{fl.totalAirport}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                      <span className="text-[11px] font-medium">IDAC Duty:</span>
                      <span className="font-mono font-black text-teal-600 dark:text-teal-400">{fl.totalIDAC}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 dark:text-slate-100 font-black border-t border-slate-200 dark:border-slate-700 pt-2 text-xs">
                      <span>Total Assigned Duties:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm font-black">
                        {fl.totalAll}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duty Equity Monitor: Highest vs Lowest Assigned Airmen (Without BD No as requested) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Highest Duty Load */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Highest Duty Load Personnel (Top 5)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Airmen assigned the most security/taskforce duties this month (Airfield duty excluded)
              </p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {highestDuties.map((s) => {
                  const airman = airmanMap.get(s.airmanId);
                  const effectiveCount = getDutyCountExcludingAirfield(s);
                  return (
                    <div key={s.airmanId} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => airman && onViewProfile(airman)}
                            className="font-black text-slate-900 dark:text-slate-100 hover:text-emerald-600 text-left"
                          >
                            {s.rank} {s.airmanName}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold">{s.flightName} Flight</p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-sm text-red-600 dark:text-red-400 font-mono">
                          {effectiveCount} Duties
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium">
                          GD:{s.totalGD} | BTF:{s.totalBTF} | NTF:{s.totalNTF} | HTF:{s.totalHalishahar} | IDAC:{s.totalIDAC || 0}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lowest Duty Load */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Lowest Duty Load Personnel (Top 5)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Airmen with least assigned duties (candidate for upcoming duties)
              </p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {lowestDuties.map((s) => {
                  const airman = airmanMap.get(s.airmanId);
                  const effectiveCount = getDutyCountExcludingAirfield(s);
                  return (
                    <div key={s.airmanId} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => airman && onViewProfile(airman)}
                            className="font-black text-slate-900 dark:text-slate-100 hover:text-emerald-600 text-left"
                          >
                            {s.rank} {s.airmanName}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold">{s.flightName} Flight</p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                          {effectiveCount} Duties
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Leave: {s.totalLeave} Days
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
