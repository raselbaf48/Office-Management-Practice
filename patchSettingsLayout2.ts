import fs from 'fs';

let code = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const blockStart = "{activeSection === 'appManagement' && role === 'SUPER_ADMIN' && (";
const blockEnd = "{activeSection === 'appearance' && (";

const startIndex = code.indexOf(blockStart);
const endIndex = code.indexOf(blockEnd);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find blocks");
  process.exit(1);
}

const newLayout = `
              {activeSection === 'appNotice' && role === 'SUPER_ADMIN' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Publish App Notice</h3>
                        <p className="text-xs text-slate-500">Show a popup notice to users when they login.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Heading</label>
                        <input 
                          type="text"
                          value={noticeDraft.heading} 
                          onChange={(e) => setNoticeDraft({ ...noticeDraft, heading: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:text-white"
                          placeholder="e.g. Important Notice"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Notice Message</label>
                        <textarea 
                          value={noticeDraft.message} 
                          onChange={(e) => setNoticeDraft({ ...noticeDraft, message: e.target.value })}
                          rows={3} 
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:text-white resize-none"
                          placeholder="Enter the notice message here..."
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notice-schedule" checked={noticeDraft.isScheduled} onChange={(e) => setNoticeDraft({ ...noticeDraft, isScheduled: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                        <label htmlFor="notice-schedule" className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Schedule</label>
                      </div>
                      
                      {noticeDraft.isScheduled && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="flex gap-2">
                            <button onClick={() => applyTimePreset(setNoticeDraft, noticeDraft, 30)} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 30 Mins</button>
                            <button onClick={() => applyTimePreset(setNoticeDraft, noticeDraft, 60)} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 1 Hour</button>
                            <button onClick={() => applyTimePreset(setNoticeDraft, noticeDraft, 120)} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 2 Hours</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">Start Time (Default: Now)</label>
                              <input type="datetime-local" value={noticeDraft.startTime || ''} onChange={(e) => setNoticeDraft({ ...noticeDraft, startTime: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">End Time</label>
                              <input type="datetime-local" value={noticeDraft.endTime || ''} onChange={(e) => setNoticeDraft({ ...noticeDraft, endTime: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-indigo-500" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end pt-2">
                        <button onClick={handleSaveNotice} disabled={!noticeDraft.message} className="disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                          <Megaphone className="w-4 h-4" /> Publish Notice
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notice History */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" /> Notice History
                    </h3>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {appConfigHistory.filter(i => i.type === 'NOTICE').length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-6">No notice history available yet.</p>
                      ) : (
                        appConfigHistory.filter(i => i.type === 'NOTICE').map((item) => (
                          <div key={item.id} className={\`p-4 rounded-xl border text-sm flex flex-col gap-3 \${item.isActive ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/50 shadow-md ring-1 ring-indigo-500/20' : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700'}\`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                  NOTICE
                                </span>
                                {item.isActive && (
                                  <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                                <button onClick={() => handleDeleteHistory(item.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete record">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              {item.heading && <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.heading}</h4>}
                              <p className={\`\${item.isActive ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-400'}\`}>{item.message}</p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {(item.startTime || item.endTime) ? (
                                  <div className="text-xs text-slate-500 bg-white dark:bg-slate-900/50 px-2 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-slate-100 dark:border-slate-700">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'} - {item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No schedule (Manual)</span>
                                )}
                              </div>
                              
                              {item.isActive && (
                                <button onClick={() => handleStopFeature('NOTICE', item.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors">
                                  <PowerOff className="w-3.5 h-3.5" /> Stop Notice
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'appMaintenance' && role === 'SUPER_ADMIN' && (
                <div className="space-y-8 animate-fadeIn">
                  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Activate Maintenance Mode</h3>
                        <p className="text-xs text-slate-500">Temporarily close the app for regular users.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Maintenance Message</label>
                        <textarea 
                          value={maintDraft.message} 
                          onChange={(e) => setMaintDraft({ ...maintDraft, message: e.target.value })}
                          rows={3} 
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-500 dark:text-white resize-none"
                          placeholder="App is currently undergoing maintenance..."
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="maint-schedule" checked={maintDraft.isScheduled} onChange={(e) => setMaintDraft({ ...maintDraft, isScheduled: e.target.checked })} className="w-4 h-4 text-amber-600 rounded border-slate-300" />
                        <label htmlFor="maint-schedule" className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Schedule</label>
                      </div>
                      
                      {maintDraft.isScheduled && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="flex gap-2">
                            <button onClick={() => applyTimePreset(setMaintDraft, maintDraft, 30)} className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 30 Mins</button>
                            <button onClick={() => applyTimePreset(setMaintDraft, maintDraft, 60)} className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 1 Hour</button>
                            <button onClick={() => applyTimePreset(setMaintDraft, maintDraft, 120)} className="px-3 py-1.5 text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1"><Clock className="w-3 h-3"/> 2 Hours</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">Start Time (Default: Now)</label>
                              <input type="datetime-local" value={maintDraft.startTime || ''} onChange={(e) => setMaintDraft({ ...maintDraft, startTime: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-amber-500" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500">End Time</label>
                              <input type="datetime-local" value={maintDraft.endTime || ''} onChange={(e) => setMaintDraft({ ...maintDraft, endTime: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white outline-none focus:border-amber-500" />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end pt-2">
                        <button onClick={handleSaveMaintenance} disabled={!maintDraft.message} className="disabled:opacity-50 disabled:cursor-not-allowed bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                          <Wrench className="w-4 h-4" /> Activate Maintenance
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance History */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" /> Maintenance History
                    </h3>
                    
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {appConfigHistory.filter(i => i.type === 'MAINTENANCE').length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-6">No maintenance history available yet.</p>
                      ) : (
                        appConfigHistory.filter(i => i.type === 'MAINTENANCE').map((item) => (
                          <div key={item.id} className={\`p-4 rounded-xl border text-sm flex flex-col gap-3 \${item.isActive ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/50 shadow-md ring-1 ring-amber-500/20' : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700'}\`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  MAINTENANCE
                                </span>
                                {item.isActive && (
                                  <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
                                <button onClick={() => handleDeleteHistory(item.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete record">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <p className={\`\${item.isActive ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-600 dark:text-slate-400'}\`}>{item.message}</p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div>
                                {(item.startTime || item.endTime) ? (
                                  <div className="text-xs text-slate-500 bg-white dark:bg-slate-900/50 px-2 py-1.5 rounded-lg inline-flex items-center gap-1.5 border border-slate-100 dark:border-slate-700">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{item.startTime ? new Date(item.startTime).toLocaleString() : 'N/A'} - {item.endTime ? new Date(item.endTime).toLocaleString() : 'N/A'}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No schedule (Manual)</span>
                                )}
                              </div>
                              
                              {item.isActive && (
                                <button onClick={() => handleStopFeature('MAINTENANCE', item.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors">
                                  <PowerOff className="w-3.5 h-3.5" /> Stop Maintenance
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              `;

code = code.slice(0, startIndex) + newLayout + code.slice(endIndex);

// Oh wait, is there an `activeSection === 'appHistory'` block I should remove?
const appHistoryBlockStart = "{activeSection === 'appHistory' && role === 'SUPER_ADMIN' && (";
if (code.includes(appHistoryBlockStart)) {
  const nextAppearanceStart = "{activeSection === 'appearance' && (";
  const indexHistory = code.indexOf(appHistoryBlockStart);
  const indexAppearance = code.indexOf(nextAppearanceStart, indexHistory);
  if (indexHistory !== -1 && indexAppearance !== -1) {
    code = code.slice(0, indexHistory) + code.slice(indexAppearance);
  }
}

fs.writeFileSync('src/components/SettingsModal.tsx', code);
console.log("Layout update completed");
