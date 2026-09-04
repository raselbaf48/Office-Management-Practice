const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

// 1. Add Settings icon import
if (!code.includes('Settings,')) {
    code = code.replace("import { AlertCircle, ", "import { AlertCircle, Settings, ");
}

// 2. Add Edit Modal State
const stateTarget = `const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null);`;
const newState = `const [deleteConfirmIdx, setDeleteConfirmIdx] = useState<number | null>(null);
  
  // Edit Duty Modal State
  const [editingDutyIdx, setEditingDutyIdx] = useState<number | null>(null);
  const [editDutyName, setEditDutyName] = useState('');
  const [editDutyFlights, setEditDutyFlights] = useState<FlightName[]>([]);
  const [editDutyRanks, setEditDutyRanks] = useState<Rank[]>([]);`;

if (code.includes(stateTarget) && !code.includes('editingDutyIdx')) {
    code = code.replace(stateTarget, newState);
}

// 3. Replace Delete button with Settings button
const trashBtn = `<button 
                        onClick={() => setDeleteConfirmIdx(idx)}
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete Duty"
                      >
                        <Trash className="w-4 h-4" />
                      </button>`;
                      
const settingsBtn = `<button 
                        onClick={() => {
                          setEditingDutyIdx(idx);
                          setEditDutyName(table.title);
                          setEditDutyFlights(table.eligibleFlights || ['Mechanics', 'Avionics', 'GCS', 'Admin']);
                          setEditDutyRanks(table.eligibleRanks || ['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2']);
                        }}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Duty Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>`;

if (code.includes(trashBtn)) {
    code = code.replace(trashBtn, settingsBtn);
}

// 4. Also replace the direct input duty name with a static text, because editing name will be inside settings
// The current Duty Name input looks like:
const nameInputTarget = `<div className="pr-16 mb-4">
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
                    </div>`;
                    
const nameTextTarget = `<div className="pr-16 mb-4">
                      <div className={\`w-full bg-transparent font-bold text-base truncate \${table.isDisabled ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}\`}>
                        {table.title}
                      </div>
                    </div>`;
                    
if (code.includes(nameInputTarget)) {
    code = code.replace(nameInputTarget, nameTextTarget);
}

// 5. Append Edit Modal JSX right before the end
const editModal = `
      {/* Edit Duty Modal */}
      {editingDutyIdx !== null && matrix && matrix[editingDutyIdx] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Duty Settings</h3>
              <button onClick={() => setEditingDutyIdx(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Duty Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={editDutyName}
                  onChange={e => setEditDutyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                  placeholder="e.g. Special Guard"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Eligible Flights</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Mechanics', 'Avionics', 'GCS', 'Admin'].map(flt => (
                    <label key={flt} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <input 
                        type="checkbox" 
                        checked={editDutyFlights.includes(flt as FlightName)} 
                        onChange={(e) => {
                          if (e.target.checked) setEditDutyFlights([...editDutyFlights, flt as FlightName]);
                          else setEditDutyFlights(editDutyFlights.filter(f => f !== flt));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">{flt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Eligible Ranks</label>
                <div className="grid grid-cols-4 gap-2">
                  {['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'].map(rank => (
                    <label key={rank} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <input 
                        type="checkbox" 
                        checked={editDutyRanks.includes(rank as Rank)} 
                        onChange={(e) => {
                          if (e.target.checked) setEditDutyRanks([...editDutyRanks, rank as Rank]);
                          else setEditDutyRanks(editDutyRanks.filter(r => r !== rank));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{rank}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <button 
                onClick={() => {
                  setDeleteConfirmIdx(editingDutyIdx);
                  setEditingDutyIdx(null);
                }} 
                className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors flex items-center space-x-2"
              >
                <Trash className="w-4 h-4" />
                <span>Delete Duty</span>
              </button>
              
              <div className="flex space-x-3">
                <button onClick={() => setEditingDutyIdx(null)} className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (!editDutyName.trim()) return;
                    if (matrix && onMatrixChange) {
                      const newMatrix = [...matrix];
                      newMatrix[editingDutyIdx] = {
                        ...newMatrix[editingDutyIdx],
                        title: editDutyName,
                        eligibleFlights: editDutyFlights,
                        eligibleRanks: editDutyRanks
                      };
                      onMatrixChange(newMatrix);
                    }
                    setEditingDutyIdx(null);
                  }}
                  disabled={!editDutyName.trim()}
                  className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md rounded-xl transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('editingDutyIdx !== null && matrix && matrix[editingDutyIdx]')) {
    code = code.replace(/    <\/div>\n  \);\n};\n?$/, editModal + '    </div>\n  );\n};\n');
}

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
console.log("Updated config panel");
