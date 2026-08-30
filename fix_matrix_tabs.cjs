const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// 1. Add settingsTab state
code = code.replace(
  /const \[isSettingsOpen, setIsSettingsOpen\] = useState<boolean>\(false\);/,
  "const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);\n  const [settingsTab, setSettingsTab] = useState<'Overall' | 'Mechanics' | 'Avionics' | 'GCS'>('Overall');"
);

// 2. Add Tab Switcher in the Settings Modal
const oldModalTop = `<div className="p-5 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-slate-500 mb-4">
                Configure the Monthly Target requirements for each duty type. 
                This will update the total required slots shown in the matrix headers and the Total Monthly Slots summary.
              </p>`;

const newModalTop = `<div className="px-5 pt-3 flex border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 overflow-x-auto hide-scrollbar">
              {['Overall', 'Mechanics', 'Avionics', 'GCS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab as any)}
                  className={\`px-4 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap \${
                    settingsTab === tab 
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }\`}
                >
                  {tab} Targets
                </button>
              ))}
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <p className="text-[11px] text-slate-500 mb-2">
                Configure the Monthly Target for <strong>{settingsTab}</strong>. 
                {settingsTab === 'Overall' ? ' This updates the grand total in the header.' : ' This updates the target when filtering by this flight.'}
              </p>`;

code = code.replace(oldModalTop, newModalTop);

// 3. Update the Input in Settings Modal to use the correct target
const oldInput = `<label className="block text-[10px] font-bold text-slate-500 mb-1">Monthly Target</label>
                    <input
                      type="number"
                      value={table.totalRequiredMonth || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newMatrix = [...matrix];
                        newMatrix[tIdx].totalRequiredMonth = val;
                        setMatrix(newMatrix);
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />`;

const newInput = `<label className="block text-[10px] font-bold text-slate-500 mb-1">
                      {settingsTab === 'Overall' ? 'Overall Monthly Target' : \`\${settingsTab} Target\`}
                    </label>
                    <input
                      type="number"
                      value={settingsTab === 'Overall' ? (table.totalRequiredMonth || 0) : (table.flightTargets?.[settingsTab as 'Mechanics' | 'Avionics' | 'GCS'] || 0)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newMatrix = [...matrix];
                        if (settingsTab === 'Overall') {
                          newMatrix[tIdx].totalRequiredMonth = val;
                        } else {
                          const fTarget = settingsTab as 'Mechanics' | 'Avionics' | 'GCS';
                          newMatrix[tIdx].flightTargets = {
                            ...(newMatrix[tIdx].flightTargets || {}),
                            [fTarget]: val
                          };
                        }
                        setMatrix(newMatrix);
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />`;

code = code.replace(oldInput, newInput);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
