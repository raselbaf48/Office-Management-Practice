const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                  {/* Cloud Sync */}
                  {activeSection === 'cloudsync' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Cloud className="w-5 h-5 text-blue-500" />
                            Database Sync History
                          </h4>
                          <button onClick={() => setSyncLogsState(getSyncLogs())} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                        {syncLogsState.length === 0 ? (
                          <div className="text-center py-8">
                            <Cloud className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No sync logs available.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {syncLogsState.map((log) => (
                              <div key={log.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                  {log.status === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.action}</p>
                                    <p className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                                  </div>
                                </div>
                                {log.details && <p className="text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded truncate max-w-[200px]">{log.details}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}`;

const newStr = `                  {/* Cloud Sync */}
                  {activeSection === 'cloudsync' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (
                    <div className="space-y-6 animate-fadeIn max-w-md mx-auto">
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-transparent">
                        <div className="w-16 h-16 rounded-full bg-[#1e2b4d] flex items-center justify-center mb-6">
                          <Cloud className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Database Cloud Sync</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                          Manually push your local changes or pull updates from the central Firebase database.
                        </p>
                        <button 
                          onClick={async () => {
                            setRestoreStatus('Syncing...');
                            await localDb.syncFromFirebase();
                            setSyncLogsState(getSyncLogs());
                            setRestoreStatus('');
                            if (onRosterUpdated) onRosterUpdated();
                          }} 
                          disabled={restoreStatus === 'Syncing...'}
                          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
                        >
                          <RefreshCw className={\`w-5 h-5 \${restoreStatus === 'Syncing...' ? 'animate-spin' : ''}\`} />
                          Sync Now
                        </button>
                      </div>

                      <div className="mt-8">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">Recent Sync Logs</h4>
                        {syncLogsState.length === 0 ? (
                          <div className="text-center py-8 bg-slate-800/30 rounded-2xl">
                            <p className="text-sm font-bold text-slate-500">No recent logs.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {syncLogsState.map((log: any) => (
                              <div key={log.id} className="p-4 bg-[#1b2234] border border-slate-700/50 rounded-xl flex justify-between items-start">
                                <div className="flex gap-3">
                                  <div className="pt-1.5 shrink-0">
                                    <div className={\`w-2.5 h-2.5 rounded-full \${log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'}\`}></div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white mb-1">
                                      {log.type === 'PULL' ? 'Downloaded from Cloud' : 'Uploaded to Cloud'}
                                    </p>
                                    <p className="text-xs text-slate-400">{log.message}</p>
                                  </div>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono text-right shrink-0 mt-1">
                                  {new Date(log.timestamp).toLocaleDateString()}<br/>
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(file, content);
  console.log("Replaced cloud sync UI!");
} else {
  console.log("Could not find the target cloud sync string.");
}
