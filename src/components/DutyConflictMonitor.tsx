import React, { useState, useEffect } from 'react';
import { Airman, ConflictAlert } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, RefreshCw, Calendar, ArrowRight, User } from 'lucide-react';

interface DutyConflictMonitorProps {
  airmen: Airman[];
  onViewProfile: (airman: Airman) => void;
  onNavigateToRegister?: () => void;
}

export const DutyConflictMonitor: React.FC<DutyConflictMonitorProps> = ({
  airmen,
  onViewProfile,
  onNavigateToRegister,
}) => {
  const today = new Date();
  const [monthKey, setMonthKey] = useState<string>(
    `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`
  );
  const [alerts, setAlerts] = useState<ConflictAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?month=${monthKey}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.conflictAlerts || []);
      }
    } catch (err) {
      console.error('Failed to load conflict alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const handleGlobalUpdate = () => {
      fetchAlerts();
    };
    window.addEventListener('baf_state_updated', handleGlobalUpdate);
    return () => {
      window.removeEventListener('baf_state_updated', handleGlobalUpdate);
    };
  }, [monthKey]);

  const airmanMap = new Map(airmen.map((a) => [a.id, a]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Smart Duty Governance • 155 UASU BAF</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Duty Conflict Monitor (ডিউটি কনফ্লিক্ট মনিটর)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ছুটি, টিডিওয়াই ও পরপর ডিউটি সংক্রান্ত রুলস ভায়োলেশন এবং অটোমেটিক কনফ্লিক্ট ডিটেকশন
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

      {/* Overview Status Banner */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <p className="text-xs font-bold">Checking roster compliance...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200">
            কোনো কনফ্লিক্ট পাওয়া যায়নি (All Rosters Compliant)
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
            {monthKey} মাসের সকল ডিউটি অ্যাসাইনমেন্ট BAF নিয়মাবলী অনুসারে সঠিক রয়েছে। কোনো ওভারল্যাপিং বা ছুটি লঙ্ঘন নেই।
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <div>
                <h4 className="text-xs font-black text-rose-900 dark:text-rose-200">
                  {alerts.length} টি সম্ভাব্য কনফ্লিক্ট পাওয়া গেছে
                </h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">
                  ছুটি, টিডিওয়াই অথবা ব্যাক-টু-ব্যাক ডিউটি সমন্বয়ের জন্য নিচের তালিকা পর্যালোচনা করুন।
                </p>
              </div>
            </div>

            {onNavigateToRegister && (
              <button
                onClick={onNavigateToRegister}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs transition-colors"
              >
                Open Duty Register
              </button>
            )}
          </div>

          {/* Conflict Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {alerts.map((alert, index) => {
              const airman = airmanMap.get(alert.airmanId);
              return (
                <div
                  key={alert.id ? `${alert.id}-${index}` : `conflict-${alert.airmanId}-${alert.date}-${index}`}
                  className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                        {alert.ruleType || 'RULE CONFLICT'}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                        {alert.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-2 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{alert.airmanName}</span>
                    </h4>

                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 font-medium leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    {airman && (
                      <button
                        onClick={() => onViewProfile(airman)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center space-x-1"
                      >
                        <span>View Airman History</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
