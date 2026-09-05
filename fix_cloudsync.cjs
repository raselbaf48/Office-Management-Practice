const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const appearanceEndStr = `                              <span className="mt-2 text-sm font-bold">{themeOpt.label}</span>
                            </button>
                          ))}
                        </div>
</div>
</div>)}`;

const cloudSyncJSX = `

                  {/* Cloud Sync */}
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
                  )}
`;

content = content.replace(appearanceEndStr, appearanceEndStr + cloudSyncJSX);
fs.writeFileSync(file, content);
