const fs = require('fs');
let code = fs.readFileSync('src/components/EntryHistoryModal.tsx', 'utf8');

// Find where <div className="space-y-1.5"> is
let idx1 = code.indexOf('<div className="space-y-1.5">');

if (idx1 !== -1) {
    let before = code.substring(0, idx1);
    let after = code.substring(idx1);
    
    // now we need to replace the `</div>` that closes this with `</> </div>`
    // Wait, let's just write a regex
    let t = `                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => startEditing(item)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors flex items-center space-x-1"
                      title="Edit this entry or change airman"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit</span>
                    </button>`;

    let r = `                      </div>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {item.actionType !== 'SYSTEM_ACTION' && (
                    <button
                      onClick={() => startEditing(item)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors flex items-center space-x-1"
                      title="Edit this entry or change airman"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit</span>
                    </button>
                    )}`;
    code = code.replace(t, r);
}
fs.writeFileSync('src/components/EntryHistoryModal.tsx', code);
