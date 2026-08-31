const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

// Replace the old settings modal
const oldSettingsModal = `      {/* Duty Targets Settings Modal */}
            {isSettingsOpen && (role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden sm:p-6 sm:justify-center sm:items-center animate-fadeIn">
          <div className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-md bg-slate-50 dark:bg-slate-950 sm:rounded-3xl sm:shadow-2xl flex flex-col overflow-hidden relative">
            <div className="flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 shrink-0 border-b border-slate-200 dark:border-slate-800">
              {settingsTab ? (
                <button 
                  onClick={() => setSettingsTab(null)} 
                  className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={() => setIsSettingsOpen(false)} 
                  className="mr-3 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-lg font-semibold tracking-wide flex-1 pr-10">
                {settingsTab ? \`\${settingsTab} Targets\` : 'Duty Targets'}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {!settingsTab ? (
                <div className="p-4 space-y-2">
                  <button onClick={() => setSettingsTab('Overall')} className="w-full p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group">
                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Overall Limits</span>
                  </button>
                  {flights.map(fl => (
                    <button key={fl} onClick={() => setSettingsTab(fl)} className="w-full p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group">
                      <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{fl} Flight Targets</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {settingsTab === 'Overall' ? (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Month Totals</h4>
                      <p className="text-xs text-slate-500 mb-4">Edit the maximum required duty quotas per month.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {matrix.map((table, tIdx) => (
                          <div key={table.id}>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                              {table.title}
                            </label>
                            <input
                              type="number"
                              value={table.totalRequiredMonth}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const updated = [...matrix];
                                updated[tIdx].totalRequiredMonth = val;
                                setMatrix(updated);
                                setIsSaved(false);
                              }}
                              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : flights.map((flight) => {
                    if (flight !== settingsTab) return null;
                    return (
                      <div key={flight} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">{flight}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {matrix.map((table, tIdx) => (
                            <div key={table.id}>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                {table.title}
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={table.targets?.[flight as FlightName] || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  const updated = [...matrix];
                                  if (!updated[tIdx].targets) updated[tIdx].targets = {} as Record<FlightName, number>;
                                  updated[tIdx].targets![flight as FlightName] = val;
                                  setMatrix(updated);
                                  setIsSaved(false);
                                }}
                                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                   
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        saveDutyMatrix(matrix);
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2500);
                        setSettingsTab(null);
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}`;

const newSettingsModal = `      {/* Duty Targets Settings Modal */}
      {isSettingsOpen && (role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <DutyRatioSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}`;

const importStatement = `import { DutyRatioSettingsModal } from './DutyRatioSettingsModal';\n`;

// Also need to find and replace the block
const splitToken = '{/* Duty Targets Settings Modal */}';
const parts = file.split(splitToken);
if(parts.length > 1) {
    let newFile = parts[0] + newSettingsModal + parts[1].substring(parts[1].indexOf(')') + 1, parts[1].length).substring(parts[1].indexOf('}') + 1).substring(parts[1].indexOf('}') + 1).substring(parts[1].indexOf('}') + 1).substring(parts[1].indexOf('}') + 1).substring(parts[1].indexOf('}') + 1).substring(parts[1].indexOf('}') + 1).substring(parts[1].indexOf('}') + 1);
    
    // Instead of complex string manipulation let's use sed logic or simpler replace
}

