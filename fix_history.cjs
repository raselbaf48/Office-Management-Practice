const fs = require('fs');
let code = fs.readFileSync('src/components/EntryHistoryModal.tsx', 'utf8');

const target = `                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {item.actionType !== 'SYSTEM_ACTION' && (
                      <>
                    <button
                      onClick={() => startEditing(item)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors flex items-center space-x-1"
                      title="Edit this entry or change airman"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleUndo(item)}
                      disabled={actionLoadingId === item.id}
                      className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold rounded-lg transition-colors flex items-center space-x-1"
                      title="Undo or revert this entry back to its previous state"
                    >
                      {actionLoadingId === item.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                      <span>Revert / Undo</span>
                    </button>
                    )}
                  </div>
                </div>
              </div>
          <div className="p-4 border-t border-slate-100`;

const replacement = `                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {item.actionType !== 'SYSTEM_ACTION' && (
                      <>
                        <button
                          onClick={() => startEditing(item)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors flex items-center space-x-1"
                          title="Edit this entry or change airman"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleUndo(item)}
                          disabled={actionLoadingId === item.id}
                          className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold rounded-lg transition-colors flex items-center space-x-1"
                          title="Undo or revert this entry back to its previous state"
                        >
                          {actionLoadingId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          <span>Revert / Undo</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>`;
                
// It was replacing up to `          <div className="p-4 border-t border-slate-100` so we also need to include that back if it was replaced.

code = code.replace(/\{\/\* Actions \*\/\}[\s\S]*?Revert \/ Undo<\/span>\s*<\/button>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="p-4 border-t border-slate-100/,
`{/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {item.actionType !== 'SYSTEM_ACTION' && (
                      <>
                        <button
                          onClick={() => startEditing(item)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors flex items-center space-x-1"
                          title="Edit this entry or change airman"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleUndo(item)}
                          disabled={actionLoadingId === item.id}
                          className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold rounded-lg transition-colors flex items-center space-x-1"
                          title="Undo or revert this entry back to its previous state"
                        >
                          {actionLoadingId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          <span>Revert / Undo</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100`
);

fs.writeFileSync('src/components/EntryHistoryModal.tsx', code);
