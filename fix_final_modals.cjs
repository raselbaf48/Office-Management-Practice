const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the line that has '</div></div></div></div></div>' (should be around 1127)
const closingIdx = lines.findIndex(l => l.includes('</div></div></div></div></div>'));

const newTail = `
          </div>
        </div>
        
        {/* Delete Single History Item Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Delete Record?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this record from history? If this notice or maintenance is currently live, it will also be stopped.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    confirmDeleteHistory(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {clearAllConfirmType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Clear All {clearAllConfirmType === 'NOTICE' ? 'Notices' : 'Maintenance Records'}?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                This will delete all {clearAllConfirmType === 'NOTICE' ? 'notice' : 'maintenance'} history items and immediately deactivate any live {clearAllConfirmType === 'NOTICE' ? 'notice' : 'maintenance'} popup.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setClearAllConfirmType(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (clearAllConfirmType === 'NOTICE') {
                      const updatedConfig = { ...appConfig, notice: { ...appConfig.notice, isActive: false, message: '' } };
                      saveAppConfig(updatedConfig);
                      setAppConfig(updatedConfig);
                    } else {
                      const updatedConfig = { ...appConfig, maintenance: { ...appConfig.maintenance, isActive: false, message: '' } };
                      saveAppConfig(updatedConfig);
                      setAppConfig(updatedConfig);
                    }
                    const remaining = appConfigHistory.filter(i => i.type !== clearAllConfirmType);
                    localStorage.setItem('baf_app_config_history', JSON.stringify(remaining));
                    setAppConfigHistory(remaining);
                    setClearAllConfirmType(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
`;

lines.splice(closingIdx - 1, lines.length - closingIdx + 1, ...newTail.split('\n'));
fs.writeFileSync(file, lines.join('\n'));
