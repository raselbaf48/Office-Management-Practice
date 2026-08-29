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
  KeyRound,
  Globe,
  Save,
  Trash2,
} from 'lucide-react';
import {
  getSupabaseSyncState,
  clearSupabaseSyncErrors,
  localDb,
  SupabaseSyncStatusState,
  SupabaseSyncErrorEvent,
} from '../services/localDatabase';
import {
  saveCustomSupabaseCredentials,
  clearCustomSupabaseCredentials,
  resolveSupabaseCredentials,
} from '../services/supabaseClient';

export const SupabaseSyncBanner: React.FC = () => {
  const [syncState, setSyncState] = useState<SupabaseSyncStatusState>(getSupabaseSyncState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [testRunning, setTestRunning] = useState(false);
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  // In-app credentials form state
  const [inputUrl, setInputUrl] = useState('');
  const [inputKey, setInputKey] = useState('');

  const [testResult, setTestResult] = useState<{
    timestamp: string;
    success: boolean;
    operation: string;
    message: string;
    insertedRecord?: any;
    readBackRecord?: any;
  } | null>(null);

  useEffect(() => {
    const creds = resolveSupabaseCredentials();
    setInputUrl(creds.url || '');
    setInputKey(creds.key || '');

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

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCreds(true);
    setConfigSuccess(null);

    const cleanUrl = inputUrl.trim();
    const cleanKey = inputKey.trim();

    if (!cleanUrl || !cleanKey) {
      alert('Please provide both Supabase Project URL and Anon API Key.');
      setIsSavingCreds(false);
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      alert('Supabase Project URL must start with https:// or http://');
      setIsSavingCreds(false);
      return;
    }

    saveCustomSupabaseCredentials(cleanUrl, cleanKey);
    setSyncState(getSupabaseSyncState());

    // Trigger immediate pull to sync database
    try {
      await localDb.syncFromSupabase();
      setConfigSuccess('Supabase Cloud connected and synchronized successfully!');
    } catch {
      setConfigSuccess('Credentials saved! Verify connection using Test Write/Read below.');
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleClearCredentials = () => {
    if (window.confirm('Disconnect custom Supabase credentials and return to local storage mode?')) {
      clearCustomSupabaseCredentials();
      setInputUrl('');
      setInputKey('');
      setConfigSuccess(null);
      setTestResult(null);
      setSyncState(getSupabaseSyncState());
    }
  };

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
    urlValue: '',
    keyPreview: '',
    source: 'none',
    statusMessage: '',
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
              <span>{syncState.d1Active ? 'Cloudflare D1 Database:' : 'Cloud Database Sync:'}</span>
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
                {hasErrors
                  ? 'Sync Error / Blocked'
                  : !isConfigured
                  ? 'Unconfigured (Local Only)'
                  : status === 'syncing'
                  ? 'Syncing...'
                  : syncState.d1Active
                  ? 'Active (D1 Cloud)'
                  : 'Connected (Supabase)'}
              </span>
            </div>
            <p className="text-[11px] text-white/70">
              {syncState.d1Active
                ? `Cloudflare D1 active. Real-time persistence enabled across devices. Last sync: ${lastSyncTime || 'Startup'}.`
                : !isConfigured
                ? `Cloud database not connected. Using local storage. Click "Connect Cloud Database" or bind D1 in Cloudflare.`
                : hasErrors
                ? `${activeErrors.length} sync failure(s) detected. Full details logged in diagnostics.`
                : `Active cloud database connection established (${diagnostics.source}). Last synced at ${lastSyncTime || 'Startup'}.`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isConfigured ? (
            <button
              id="btn-configure-supabase"
              onClick={() => setIsExpanded(true)}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Connect Cloud Database</span>
            </button>
          ) : (
            <>
              <button
                id="btn-run-supabase-test"
                onClick={handleRunSelfTest}
                disabled={testRunning}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-medium flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
                title="Runs an insert followed by an immediate read-back test on the airmen table"
              >
                {testRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5 text-emerald-300" />}
                <span>{testRunning ? 'Testing...' : 'Test Write/Read'}</span>
              </button>

              <button
                id="btn-resync-supabase"
                onClick={handleManualResync}
                disabled={status === 'syncing'}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition-all border border-white/20 cursor-pointer"
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
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 border border-white/20 cursor-pointer"
          >
            <span>{isExpanded ? 'Hide' : 'Diagnostics & Settings'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {hasErrors && (
            <button
              id="btn-clear-sync-errors"
              onClick={clearSupabaseSyncErrors}
              className="p-1 rounded hover:bg-rose-800 text-rose-200 cursor-pointer"
              title="Clear Error Banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Diagnostics & Configuration Panel */}
      {isExpanded && (
        <div className="bg-slate-900 text-slate-200 p-4 border-t border-slate-800 space-y-4">
          {/* Cloud Database Setup Box */}
          <div className="bg-slate-800/90 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Connect Supabase Cloud Database (Multi-Device Sync)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect your Supabase project so data remains permanently saved and synchronized across all phones, tablets, and computers.
                </p>
              </div>

              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 shrink-0 underline"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {configSuccess && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-700 rounded-lg text-xs text-emerald-200 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{configSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-400" />
                    <span>Supabase Project URL:</span>
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://xyzabcdefgh.supabase.co"
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Found in Supabase: Project Settings → API → Project URL
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Supabase Anon / Public API Key:</span>
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-500 outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Found in Supabase: Project Settings → API → Project API Keys (anon public)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-[11px] text-slate-400">
                  <span>💡 Tip: You can also set </span>
                  <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code>
                  <span> and </span>
                  <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>
                  <span> in Cloudflare Pages settings for permanent build injection.</span>
                </div>

                <div className="flex items-center gap-2">
                  {inputUrl || inputKey ? (
                    <button
                      type="button"
                      onClick={handleClearCredentials}
                      className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSavingCreds}
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSavingCreds ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSavingCreds ? 'Connecting...' : 'Save & Connect Cloud'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Diagnostic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 font-mono block text-[10px]">SUPABASE_URL</span>
              <span className="font-semibold text-white truncate block">
                {diagnostics.hasUrl ? `${diagnostics.urlValue}` : '❌ Missing'}
              </span>
              <span className="text-[10px] text-slate-400">Source: {diagnostics.source}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 font-mono block text-[10px]">ANON_KEY / API_KEY</span>
              <span className="font-semibold text-white truncate block">
                {diagnostics.hasKey ? `${diagnostics.keyPreview}` : '❌ Missing'}
              </span>
              <span className="text-[10px] text-slate-400">Source: {diagnostics.source}</span>
            </div>

            <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
              <span className="text-slate-400 font-mono block text-[10px]">CLIENT INITIALIZED</span>
              <span className="font-semibold text-white">
                {isConfigured ? '✅ Ready (Cloud Instance Active)' : '⚠️ Not Initialized (Local Fallback)'}
              </span>
              <span className="text-[10px] text-slate-400">Mode: {isConfigured ? 'Cloud Sync' : 'Local Storage'}</span>
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
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
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
                className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer disabled:opacity-50"
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

