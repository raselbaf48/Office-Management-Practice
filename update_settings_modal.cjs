const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// We need a helper for countdown timer
const importTarget = "import React, { useState";
if (content.includes(importTarget)) {
  content = content.replace(importTarget, "import React, { useState, useEffect");
}

// Add history sections
const historyStrNotice = `                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">Create New Notice</h3>`;

const historyReplacementNotice = `                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Create New Notice</h3>
                      </div>`;

content = content.replace(historyStrNotice, historyReplacementNotice);

// Add Notice History underneath
const endPublishNotice = `<Megaphone className="w-4 h-4" /> Publish Notice
                        </button>
                      </div>
                    </div>`;

const noticeHistoryUI = `<Megaphone className="w-4 h-4" /> Publish Notice
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
                    </div>`;

content = content.replace(endPublishNotice, noticeHistoryUI);


// Maintenance History underneath
const endPublishMaint = `<Wrench className="w-4 h-4" /> Enable Maintenance Mode
                        </button>
                      </div>
                    </div>`;

const maintHistoryUI = `<Wrench className="w-4 h-4" /> Enable Maintenance Mode
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
                    </div>`;

content = content.replace(endPublishMaint, maintHistoryUI);

fs.writeFileSync(file, content);
console.log("History added to SettingsModal");
