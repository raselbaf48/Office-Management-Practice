const fs = require('fs');
let code = fs.readFileSync('src/components/EntryHistoryModal.tsx', 'utf8');

const target = `                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 flex-wrap">`;

const replacement = `                    <div className="space-y-1.5">
                      {item.actionType === 'SYSTEM_ACTION' ? (
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              SYSTEM ACTION
                            </span>
                            <span className="flex items-center space-x-1 text-slate-400 text-[11px]">
                              <Clock className="w-3 h-3" />
                              <span>Logged: {dateStr} at {timeStr}</span>
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                            {item.description || item.notes}
                          </div>
                        </div>
                      ) : (
                        <>
                      <div className="flex items-center space-x-2 flex-wrap">`;

code = code.replace(target, replacement);

const target2 = `                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => startEditing(item)}`;

const replacement2 = `                      </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {item.actionType !== 'SYSTEM_ACTION' && (
                      <button
                        onClick={() => startEditing(item)}`;

code = code.replace(target2, replacement2);

const target3 = `                    </button>
                  </div>
                </div>`;
                
const replacement3 = `                    </button>
                    )}
                  </div>
                </div>`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/EntryHistoryModal.tsx', code);
