import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Database,
  PlayCircle,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  getSupabaseSyncState,
  clearSupabaseSyncErrors,
  localDb,
  SupabaseSyncStatusState,
  SupabaseSyncErrorEvent,
} from '../services/localDatabase';

export const SupabaseSyncBanner: React.FC = () => {
  const [syncState, setSyncState] = useState<SupabaseSyncStatusState>(getSupabaseSyncState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    timestamp: string;
    success: boolean;
    operation: string;
    message: string;
    insertedRecord?: any;
    readBackRecord?: any;
  } | null>(null);

  useEffect(() => {
    const handleSyncUpdate = (e: any) => {
      if (e?.detail && typeof e.detail === 'object' && 'activeErrors' in e.detail) {
        setSyncState(e.detail);
      } else {
        setSyncState(getSupabaseSyncState());
      }
    };

    const handleGlobalUpdate = () => {
      setSyncState(getSupabaseSyncState());
    };

    window.addEventListener('supabase_sync_update', handleSyncUpdate);
    window.addEventListener('baf_state_updated', handleGlobalUpdate);

    // Initial check
    setSyncState(getSupabaseSyncState());

    return () => {
      window.removeEventListener('supabase_sync_update', handleSyncUpdate);
      window.removeEventListener('baf_state_updated', handleGlobalUpdate);
    };
  }, []);

  const handleRunSelfTest = async () => {
    setTestRunning(true);
    setTestResult(null);
    try {
      const result = await localDb.testSupabaseWriteRead({
        name: `Diagnostic Test ${new Date().toLocaleTimeString()}`,
      });
      setTestResult({
        timestamp: new Date().toLocaleTimeString(),
        success: result.success,
        operation: result.operation,
        message: result.success
          ? 'Write & Read verified! Temporary test record was inserted, retrieved, and cleaned up.'
          : (result.error?.message || 'Verification test encountered an issue.'),
        insertedRecord: result.insertedRecord,
        readBackRecord: result.readBackRecord,
      });
      // Refresh state
      setSyncState(getSupabaseSyncState());
    } catch (err: any) {
      setTestResult({
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        operation: 'TEST_RUNNER_ERROR',
        message: err?.message || String(err),
      });
    } finally {
      setTestRunning(false);
    }
  };

  const handleManualResync = async () => {
    await localDb.syncFromSupabase();
    setSyncState(getSupabaseSyncState());
  };

  const isConfigured = syncState?.isConfigured ?? false;
  const status = syncState?.status ?? 'unconfigured';
  const lastSyncTime = syncState?.lastSyncTime ?? null;
  const activeErrors = Array.isArray(syncState?.activeErrors) ? syncState.activeErrors : [];
  const diagnostics = syncState?.diagnostics ?? {
    hasUrl: false,
    hasKey: false,
    clientInitialized: false,
    isConfigured: false,
  };

  // Render when there are active errors OR unconfigured state OR user runs test
  const hasErrors = activeErrors.length > 0;

  return (
    <div id="supabase-sync-banner-root" className="w-full font-sans border-b text-xs sm:text-sm">
      {/* Top Banner Status Bar */}
      <div
        className={`px-4 py-2 flex flex-wrap items-center justify-between gap-2 transition-colors ${
          hasErrors
            ? 'bg-rose-950/90 text-rose-100 border-rose-800'
            : !isConfigured
            ? 'bg-amber-950/90 text-amber-100 border-amber-800'
            : status === 'syncing'
            ? 'bg-sky-950/90 text-sky-100 border-sky-800'
            : 'bg-emerald-950/80 text-emerald-100 border-emerald-800'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="p-1 rounded bg-black/30">
            {hasErrors ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : !isConfigured ? (
              <Info className="w-4 h-4 text-amber-400" />
            ) : status === 'syncing' ? (
              <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>

          <div>
            <div className="font-semibold flex items-center gap-2">
              <span>Supabase Cloud Sync:</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider ${
                  hasErrors
                    ? 'bg-rose-600 text-white font-bold'
                    : !isConfigured
                    ? 'bg-amber-600 text-white'
                    : status === 'syncing'
                    ? 'bg-sky-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {hasErrors ? 'Sync Error / Blocked' : !isConfigured ? 'Unconfigured (Local Only)' : status === 'syncing' ? 'Syncing...' : 'Connected'}
              </span>
            </div>
            <p className="text-[11px] text-white/70">
              {!isConfigured
                ? `Supabase credentials missing. App is currently using local browser database (localStorage).`
                : hasErrors
                ? `${activeErrors.length} sync failure(s) detected. Full details logged to console.error.`
                : `Active connection established. Last synchronized at ${lastSyncTime || 'Startup'}.`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isConfigured && (
            <>
              <button
                id="btn-run-supabase-test"
                onClick={handleRunSelfTest}
                disabled={testRunning}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium flex items-center gap-1.5 transition-all border border-white/20"
                title="Runs an insert followed by an immediate read-back test on the airmen table"
              >
                {testRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5 text-emerald-300" />}
                <span>{testRunning ? 'Testing...' : 'Test Write/Read'}</span>
              </button>

              <button
                id="btn-resync-supabase"
                onClick={handleManualResync}
                disabled={status === 'syncing'}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition-all border border-white/20"
                title="Trigger fresh data sync from Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Pull Latest</span>
              </button>
            </>
          )}

          <button
            id="btn-toggle-sync-details"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 border border-white/20"
          >
            <span>{isExpanded ? 'Hide Details' : 'Diagnostics & Logs'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {hasErrors && (
            <button
              id="btn-clear-sync-errors"
              onClick={clearSupabaseSyncErrors}
              className="p-1 rounded hover:bg-rose-800 text-rose-200"
              title="Clear Error Banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Diagnostics & Error Inspector Panel */}
      {isExpanded && (
        <div className="bg-slate-900 text-slate-200 p-4 border-t border-slate-800 space-y-4">
          {/* Diagnostic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 font-mono block text-[10px]">SUPABASE_URL</span>
              <span className="font-semibold text-white truncate block">
                {diagnostics.hasUrl ? `${diagnostics.urlPrefix}...` : '❌ Missing'}
              </span>
              <span className="text-[10px] text-slate-400">Supports VITE_ & NEXT_PUBLIC_</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 font-mono block text-[10px]">ANON_KEY / API_KEY</span>
              <span className="font-semibold text-white truncate block">
                {diagnostics.hasKey ? `${diagnostics.keyPrefix}...` : '❌ Missing'}
              </span>
              <span className="text-[10px] text-slate-400">Supports VITE_ & NEXT_PUBLIC_</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 font-mono block text-[10px]">CLIENT INITIALIZED</span>
              <span className="font-semibold text-white">
                {diagnostics.clientInitialized ? '✅ Ready (Instance Active)' : '⚠️ Not Initialized'}
              </span>
              <span className="text-[10px] text-slate-400">Fallback: Local DB active</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 font-mono block text-[10px]">LAST SYNC STATUS</span>
              <span className="font-semibold text-white capitalize">{status}</span>
              <span className="text-[10px] text-slate-400">{lastSyncTime ? `At ${lastSyncTime}` : 'No sync recorded'}</span>
            </div>
          </div>

          {/* Test Result Message Box */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono flex flex-col gap-1.5 ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-700 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  Test Result: {testResult.operation} ({testResult.timestamp})
                </span>
                <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-black/40">
                  {testResult.success ? 'PASSED ✅' : 'FAILED ❌'}
                </span>
              </div>
              <p className="text-xs">{testResult.message}</p>
              {testResult.readBackRecord && (
                <div className="bg-black/50 p-2 rounded text-[11px] text-emerald-300 overflow-x-auto">
                  <span className="text-slate-400 block mb-1 text-[10px]">Read Back Verified Data:</span>
                  <pre>{JSON.stringify(testResult.readBackRecord, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Active Error Log List */}
          {hasErrors ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Captured Sync Failures ({activeErrors.length})
                </h4>
                <button
                  onClick={clearSupabaseSyncErrors}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  Clear All Logged Errors
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {activeErrors.map((err: SupabaseSyncErrorEvent) => (
                  <div
                    key={err.id}
                    className="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-rose-300">
                        [{err.operation}] on table <code className="bg-rose-900/60 px-1 py-0.5 rounded text-white">{err.table}</code>
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">{err.timestamp}</span>
                    </div>

                    <div className="text-rose-200 font-mono font-medium">{err.message}</div>

                    {(err.code || err.details || err.hint) && (
                      <div className="text-[11px] text-slate-300 bg-black/40 p-2 rounded space-y-0.5 font-mono">
                        {err.code && <div><span className="text-slate-500">Code:</span> {err.code}</div>}
                        {err.details && <div><span className="text-slate-500">Details:</span> {err.details}</div>}
                        {err.hint && <div><span className="text-amber-400">Hint:</span> {err.hint}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50 text-xs text-slate-400 flex items-center justify-between">
              <span>No active sync errors. Any runtime PostgREST or Supabase errors will be surfaced here in real time.</span>
              <button
                onClick={handleRunSelfTest}
                disabled={testRunning || !isConfigured}
                className="text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Trigger Self-Test
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
