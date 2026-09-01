const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Find logo block
const logoStart = content.indexOf('{/* Section: Logo */}');
const usersStart = content.indexOf('{/* Section: Users */}');
if (logoStart !== -1 && usersStart !== -1) {
  const syncSectionCode = `
          {/* Section: Cloud Sync */}
          {activeSection === 'cloudsync' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                    <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Database Cloud Sync</h3>
                  <p className="text-xs text-slate-500 mt-1 text-center max-w-[250px]">
                    Manually push your local changes or pull updates from the central Firebase database.
                  </p>
                </div>

                <button
                  onClick={() => {
                    localDb.forceSave(); // Triggers push to firebase
                    localDb.syncFromFirebase(); // Triggers pull from firebase
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mb-6"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync Now</span>
                </button>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Recent Sync Logs</h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {syncLogsState.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-4">No recent sync activity</p>
                    ) : (
                      syncLogsState.map((log) => (
                        <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start gap-3">
                          <div className={\`mt-0.5 w-2 h-2 rounded-full shrink-0 \${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'}\`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {log.type === 'PUSH' ? 'Uploaded to Cloud' : log.type === 'PULL' ? 'Downloaded from Cloud' : 'Manual Sync'}
                              </span>
                              <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate">{log.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
  `;

  content = content.substring(0, logoStart) + syncSectionCode + content.substring(usersStart);
}

// Add state for syncLogsState
if (!content.includes('const [syncLogsState, setSyncLogsState]')) {
  const stateCode = `
  const [syncLogsState, setSyncLogsState] = useState<SyncLog[]>([]);
  useEffect(() => {
    if (isOpen) {
      setSyncLogsState(getSyncLogs());
    }
  }, [isOpen]);
  useEffect(() => {
    const handleSyncLog = (e: any) => {
      setSyncLogsState(e.detail);
    };
    window.addEventListener('baf_sync_logs_updated', handleSyncLog);
    return () => window.removeEventListener('baf_sync_logs_updated', handleSyncLog);
  }, []);
`;
  content = content.replace('// Login History State', stateCode + '\n  // Login History State');
}

fs.writeFileSync('src/components/SettingsModal.tsx', content);
