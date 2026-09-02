import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldButtons = `<div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={closeProfile}
                className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>`;

const newButtons = `<div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
              {isEditingProfile ? (
                <>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-colors"
                  >
                    Cancel Edit
                  </button>
                  <button
                    onClick={saveProfile}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-sm"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={closeProfile}
                  className="px-6 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-colors"
                >
                  Close Profile
                </button>
              )}
            </div>`;

code = code.replace(oldButtons, newButtons);
fs.writeFileSync(path, code);
