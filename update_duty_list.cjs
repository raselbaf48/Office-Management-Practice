const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

// Add settingsTableIdx state inside the component
const stateHookPos = code.indexOf('const [airmen, setAirmen] = useState<Airman[]>([]);');
code = code.slice(0, stateHookPos) + `const [settingsTableIdx, setSettingsTableIdx] = useState<number | null>(null);\n  ` + code.slice(stateHookPos);


const startDutyList = `<div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-400 dark:border-slate-700 text-center bg-white dark:bg-slate-900">`;
const endDutyList = `              </table>
            </div>`;
const startIndex = code.indexOf(startDutyList);
const endIndex = code.indexOf(endDutyList, startIndex) + endDutyList.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find Duty List table");
  process.exit(1);
}

const replacement = `
            {/* Box Type Duty List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {matrix && matrix.map((table, idx) => {
                const maxDaily = Math.max(...(table.dailyRequirements || []), table.totalRequiredDaily || 0);
                return (
                  <div key={table.id} className={\`relative p-4 rounded-xl border transition-colors \${table.isDisabled ? 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 opacity-60' : 'bg-white border-indigo-100 shadow-sm dark:bg-slate-900 dark:border-indigo-900/50'}\`}>
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <button 
                        onClick={() => {
                          if (onMatrixChange) {
                            const newMatrix = [...matrix];
                            newMatrix[idx] = { ...newMatrix[idx], isDisabled: !newMatrix[idx].isDisabled };
                            onMatrixChange(newMatrix);
                          }
                        }}
                        className={\`p-1.5 rounded-md transition-colors \${table.isDisabled ? 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}\`}
                        title={table.isDisabled ? 'Enable Duty' : 'Disable Duty (Temporary)'}
                      >
                        {table.isDisabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => {
                          if (onMatrixChange && window.confirm('Are you sure you want to delete this duty?')) {
                            const newMatrix = matrix.filter((_, i) => i !== idx);
                            onMatrixChange(newMatrix);
                          }
                        }}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete Duty"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Duty Name */}
                    <div className="pr-16 mb-4">
                      <input
                        type="text"
                        value={table.title}
                        onChange={(e) => {
                          if (onMatrixChange) {
                            const newMatrix = [...matrix];
                            newMatrix[idx] = { ...newMatrix[idx], title: e.target.value };
                            onMatrixChange(newMatrix);
                          }
                        }}
                        className={\`w-full bg-transparent outline-none font-bold text-base \${table.isDisabled ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}\`}
                        placeholder="Duty Name"
                      />
                    </div>

                    {/* Daily Req Box */}
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Daily Max Req</span>
                        <div className="flex items-baseline space-x-1">
                          <span className={\`font-mono text-xl font-black \${table.isDisabled ? 'text-slate-400' : 'text-indigo-600 dark:text-indigo-400'}\`}>{maxDaily}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setSettingsTableIdx(idx)}
                        className={\`p-2 rounded-full transition-colors \${table.isDisabled ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-500 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50'}\`}
                        disabled={table.isDisabled}
                        title="Configure Daily Requirements"
                      >
                        <Calendar className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Monthly Total:</span>
                      <span className={\`text-sm font-bold font-mono \${table.isDisabled ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}\`}>{table.totalRequiredMonth || 0}</span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Modal for Calendar configuration */}
            {settingsTableIdx !== null && matrix && matrix[settingsTableIdx] && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Configure Daily Requirements</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{matrix[settingsTableIdx].title}</p>
                    </div>
                    <button 
                      onClick={() => setSettingsTableIdx(null)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/50">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <div>
                           <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300 mb-1">Set Requirement for All Days</h4>
                           <p className="text-xs text-indigo-700/80 dark:text-indigo-300/70">Applies a default value to the entire month.</p>
                        </div>
                        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <input 
                            type="number"
                            min="0"
                            id="panelGlobalReqInput"
                            className="w-16 px-2 py-1.5 text-sm font-bold font-mono text-center bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:border-indigo-500"
                            defaultValue={matrix[settingsTableIdx]?.totalRequiredDaily || 0}
                          />
                          <button 
                            onClick={() => {
                              const val = parseInt((document.getElementById('panelGlobalReqInput') as HTMLInputElement).value, 10);
                              if (isNaN(val)) return;
                              if (onMatrixChange) {
                                const updated = [...matrix];
                                updated[settingsTableIdx].dailyRequirements = new Array(31).fill(val);
                                updated[settingsTableIdx].totalRequiredDaily = val;
                                updated[settingsTableIdx].totalRequiredMonth = val * 31;
                                onMatrixChange(updated);
                              }
                            }}
                            className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                          >
                            Apply to All
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 sm:gap-3">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum, idx) => {
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
                                  if (onMatrixChange) {
                                    const updated = [...matrix];
                                    const currentReqs = updated[settingsTableIdx].dailyRequirements || new Array(31).fill(updated[settingsTableIdx].totalRequiredDaily || 0);
                                    currentReqs[idx] = val;
                                    updated[settingsTableIdx].dailyRequirements = currentReqs;
                                    updated[settingsTableIdx].totalRequiredMonth = currentReqs.reduce((a, b) => a + b, 0);
                                    onMatrixChange(updated);
                                  }
                                }}
                                className="w-full text-center px-1 py-1.5 text-sm font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                              />
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800/50">
                    <button 
                      onClick={() => setSettingsTableIdx(null)}
                      className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Done</span>
                    </button>
                  </div>

                </div>
              </div>
            )}
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
