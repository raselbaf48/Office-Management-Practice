const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const modalCode = `
      {/* Settings Modal */}
      {settingsTableIdx !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-indigo-500" />
                Settings: {matrix[settingsTableIdx]?.title}
              </h3>
              <button
                onClick={() => setSettingsTableIdx(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50">
                <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 mb-2">Daily Requirement Calendar</h4>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70 mb-4">
                  Set the required number of duties for each day of the month.
                </p>
                
                <div className="flex items-center space-x-3 mb-6 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Set default for all days:</label>
                  <input
                    type="number"
                    min="0"
                    id="globalReqInput"
                    className="w-20 px-2 py-1 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"
                    defaultValue={matrix[settingsTableIdx]?.totalRequiredDaily || 0}
                  />
                  <button
                    onClick={() => {
                      const val = parseInt((document.getElementById('globalReqInput') as HTMLInputElement).value, 10);
                      if (isNaN(val)) return;
                      const updated = [...matrix];
                      updated[settingsTableIdx].dailyRequirements = new Array(31).fill(val);
                      updated[settingsTableIdx].totalRequiredDaily = val;
                      setMatrix(updated);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Apply to All
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                  {daysArray.map((dayNum, idx) => {
                    const req = matrix[settingsTableIdx]?.dailyRequirements?.[idx] ?? (matrix[settingsTableIdx]?.totalRequiredDaily || 0);
                    return (
                      <div key={dayNum} className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 mb-1 text-center">Day {dayNum}</label>
                        <input
                          type="number"
                          min="0"
                          value={req}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            const updated = [...matrix];
                            const currentReqs = updated[settingsTableIdx].dailyRequirements || new Array(31).fill(updated[settingsTableIdx].totalRequiredDaily || 0);
                            currentReqs[idx] = val;
                            updated[settingsTableIdx].dailyRequirements = currentReqs;
                            setMatrix(updated);
                          }}
                          className="w-full text-center px-1 py-1.5 text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <button
                onClick={() => setSettingsTableIdx(null)}
                className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSave();
                  setSettingsTableIdx(null);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save & Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  "{/* Calendar Edit Modal */}",
  modalCode + "\n      {/* Calendar Edit Modal */}"
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
