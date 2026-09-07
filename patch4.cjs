const fs = require('fs');
let code = fs.readFileSync('src/components/UserLoginDetailModal.tsx', 'utf8');

const target = `              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={closeProfile}
                  className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-colors"
                >
                  Close Profile
                </button>
              </div>`;

const replacement = `              {/* Settings & Access */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Settings</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">User Role</label>
                    <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                      <button onClick={() => handlePromote('USER')} className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-colors \${editRole === 'USER' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}>User</button>
                      <button onClick={() => handlePromote('ADMIN')} className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-colors \${editRole === 'ADMIN' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}>Admin</button>
                      {userSessionRole === 'OWNER' && (
                        <button onClick={() => handlePromote('SUPER_ADMIN')} className={\`flex-1 py-2 text-xs font-bold rounded-lg transition-colors \${editRole === 'SUPER_ADMIN' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}>Super Admin</button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Passcode</label>
                    <input
                      type="text"
                      value={editAdminPass}
                      onChange={(e) => { setEditAdminPass(e.target.value); setErrorMsg(''); }}
                      placeholder="e.g. 1124"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center space-x-2 text-rose-500 text-sm font-bold bg-rose-50 dark:bg-rose-950/50 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={closeProfile}
                  className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={saveProfile}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-2 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/UserLoginDetailModal.tsx', code);
