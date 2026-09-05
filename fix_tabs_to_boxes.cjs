const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update SETTING_SECTIONS
const settingSectionsTarget = `{ id: 'appManagement', label: 'App Management', icon: <Cpu className="w-5 h-5" />, adminOnly: true },`;
if (content.includes(settingSectionsTarget)) {
  const newSections = `  { id: 'appNotice', label: 'App Notice', icon: <Megaphone className="w-5 h-5" />, adminOnly: true },
  { id: 'maintenanceMode', label: 'Maintenance Mode', icon: <Wrench className="w-5 h-5" />, adminOnly: true },`;
  content = content.replace(settingSectionsTarget, newSections);
}

// Update the type
content = content.replace(`type SettingSection = 'profile' | 'appearance' | 'users' | 'security' | 'database' | 'appManagement' | 'about';`, `type SettingSection = 'profile' | 'appearance' | 'users' | 'security' | 'database' | 'appNotice' | 'maintenanceMode' | 'about';`);


// Replace {activeSection === 'appManagement' && role === 'SUPER_ADMIN' && (
const targetAppManagementUI = `{activeSection === 'appManagement' && role === 'SUPER_ADMIN' && (`;
const appNoticeUI = `{activeSection === 'appNotice' && role === 'SUPER_ADMIN' && (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="space-y-6 animate-fadeIn max-w-2xl">
                    {appConfig.notice.isActive && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">Notice is Currently Live</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                Active
                              </span>
                              {appConfig.notice.isScheduled && appConfig.notice.endTime && (
                                <Countdown endTime={appConfig.notice.endTime} />
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                              {appConfig.notice.heading ? \`\${appConfig.notice.heading}: \` : ''}{appConfig.notice.message}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedConfig = { ...appConfig, notice: { ...appConfig.notice, isActive: false } };
                            saveAppConfig(updatedConfig);
                            setAppConfig(updatedConfig);
                            const activeItem = appConfigHistory.find(i => i.type === 'NOTICE' && i.isActive);
                            if (activeItem) {
                              setAppConfigHistory(updateAppConfigHistoryItemActiveStatus(activeItem.id, false));
                            }
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                        >
                          <PowerOff className="w-3.5 h-3.5" /> Stop Notice
                        </button>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Create New Notice</h3>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Notice Heading</label>
                        <input type="text" value={noticeDraft.heading} onChange={(e) => setNoticeDraft({...noticeDraft, heading: e.target.value})} placeholder="e.g. Scheduled Maintenance" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Notice Message <span className="text-rose-500">*</span></label>
                        <textarea value={noticeDraft.message} onChange={(e) => setNoticeDraft({...noticeDraft, message: e.target.value})} placeholder="Enter the detailed notice message here..." rows={4} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none" />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={noticeDraft.isScheduled} onChange={(e) => setNoticeDraft({...noticeDraft, isScheduled: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 dark:border-slate-600 dark:bg-slate-900" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Schedule this notice (auto-expire)</span>
                        </label>
                      </div>

                      {noticeDraft.isScheduled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500">Start Time</label>
                              <input type="datetime-local" value={noticeDraft.startTime} onChange={(e) => setNoticeDraft({...noticeDraft, startTime: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500">End Time</label>
                              <input type="datetime-local" value={noticeDraft.endTime} onChange={(e) => setNoticeDraft({...noticeDraft, endTime: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                           </div>
                        </div>
                      )}

                      <div className="pt-4 flex justify-end">
                        <button disabled={!noticeDraft.message.trim()} onClick={handleSaveNotice} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center gap-2">
                          <Megaphone className="w-4 h-4" /> Publish Notice
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">Notice History</h3>
                      {appConfigHistory.filter(h => h.type === 'NOTICE').length === 0 ? (
                        <p className="text-sm text-slate-500">No notices in history.</p>
                      ) : (
                        <div className="space-y-3">
                          {appConfigHistory.filter(h => h.type === 'NOTICE').map(h => (
                            <div key={h.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{h.heading || 'Notice'}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{h.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(h.timestamp).toLocaleString()}</p>
                              </div>
                              <button onClick={() => handleDeleteHistoryItem(h)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>
        )}
        
        {activeSection === 'maintenanceMode' && role === 'SUPER_ADMIN' && (
            <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="space-y-6 animate-fadeIn max-w-2xl">
                    {appConfig.maintenance.isActive && (
                      <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Wrench className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-red-300">Maintenance Mode is Active</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                                Live
                              </span>
                              {appConfig.maintenance.isScheduled && appConfig.maintenance.endTime && (
                                <Countdown endTime={appConfig.maintenance.endTime} />
                              )}
                            </div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                              {appConfig.maintenance.message}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedConfig = { ...appConfig, maintenance: { ...appConfig.maintenance, isActive: false } };
                            saveAppConfig(updatedConfig);
                            setAppConfig(updatedConfig);
                            const activeItem = appConfigHistory.find(i => i.type === 'MAINTENANCE' && i.isActive);
                            if (activeItem) {
                              setAppConfigHistory(updateAppConfigHistoryItemActiveStatus(activeItem.id, false));
                            }
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
                        >
                          <PowerOff className="w-3.5 h-3.5" /> Deactivate
                        </button>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">Activate Maintenance Mode</h3>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Maintenance Message <span className="text-rose-500">*</span></label>
                        <textarea value={maintDraft.message} onChange={(e) => setMaintDraft({...maintDraft, message: e.target.value})} placeholder="e.g. System is down for scheduled upgrades." rows={4} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none" />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={maintDraft.isScheduled} onChange={(e) => setMaintDraft({...maintDraft, isScheduled: e.target.checked})} className="w-5 h-5 text-red-600 rounded-md border-slate-300 focus:ring-red-500 dark:border-slate-600 dark:bg-slate-900" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Schedule maintenance window</span>
                        </label>
                      </div>

                      {maintDraft.isScheduled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500">Start Time</label>
                              <input type="datetime-local" value={maintDraft.startTime} onChange={(e) => setMaintDraft({...maintDraft, startTime: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500">End Time</label>
                              <input type="datetime-local" value={maintDraft.endTime} onChange={(e) => setMaintDraft({...maintDraft, endTime: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white" />
                           </div>
                        </div>
                      )}

                      <div className="pt-4 flex justify-end">
                        <button disabled={!maintDraft.message.trim()} onClick={handleSaveMaintenance} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center gap-2">
                          <Wrench className="w-4 h-4" /> Enable Maintenance Mode
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">Maintenance History</h3>
                      {appConfigHistory.filter(h => h.type === 'MAINTENANCE').length === 0 ? (
                        <p className="text-sm text-slate-500">No maintenance records.</p>
                      ) : (
                        <div className="space-y-3">
                          {appConfigHistory.filter(h => h.type === 'MAINTENANCE').map(h => (
                            <div key={h.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Maintenance Mode</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{h.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(h.timestamp).toLocaleString()}</p>
                              </div>
                              <button onClick={() => handleDeleteHistoryItem(h)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>
        )`;

// We have to completely replace the old `activeSection === 'appManagement'` block with our two new blocks.
const endTarget = `        {activeSection === 'users' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (`;
const startIndex = content.indexOf(targetAppManagementUI);
const endIndex = content.indexOf(endTarget);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + appNoticeUI + "\n        " + content.substring(endIndex);
}

fs.writeFileSync(file, content);
console.log("Tabs split into boxes successfully!");
