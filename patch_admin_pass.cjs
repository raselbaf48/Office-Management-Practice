const fs = require('fs');
let file = fs.readFileSync('src/components/SettingsModal.tsx', 'utf-8');

const adminPassBlock = `
              {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4">
                  <div className="flex items-center gap-3 mb-4 text-rose-600 dark:text-rose-400">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="font-bold">Change Admin Password</h3>
                  </div>
                  <form onSubmit={handleUpdateAdminPasscode} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Current Admin Password
                      </label>
                      <input
                        type="password"
                        value={adminCurrentPasscode}
                        onChange={(e) => setAdminCurrentPasscode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
                        placeholder="****"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        New Admin Password
                      </label>
                      <input
                        type="password"
                        value={adminNewPasscode}
                        onChange={(e) => setAdminNewPasscode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
                        placeholder="****"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Confirm New Admin Password
                      </label>
                      <input
                        type="password"
                        value={adminConfirmPasscode}
                        onChange={(e) => setAdminConfirmPasscode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-rose-400"
                        placeholder="****"
                      />
                    </div>

                    {adminPasscodeError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        {adminPasscodeError}
                      </div>
                    )}
                    
                    {adminPasscodeSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {adminPasscodeSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdatingAdminPasscode}
                      className="w-full py-3 px-4 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingAdminPasscode ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Update Admin Password</span>
                    </button>
                  </form>
                </div>
              )}`;

const target = `                  </button>
                </form>
              </div>`;

if (!file.includes('Change Admin Password')) {
  file = file.replace(target, target + adminPassBlock);
  fs.writeFileSync('src/components/SettingsModal.tsx', file, 'utf-8');
}
