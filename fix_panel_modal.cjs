const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

const ALL_RANKS = ['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2'];
const ALL_FLIGHTS = ['Mechanics', 'Avionics', 'GCS', 'Admin'];

const modalHtml = `
      {/* Add New Duty Modal */}
      {isAddingNewDuty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Add New Duty</h3>
              <button onClick={() => setIsAddingNewDuty(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Duty Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newDutyName}
                  onChange={e => setNewDutyName(e.target.value)}
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
                        checked={newDutyFlights.includes(flt as FlightName)} 
                        onChange={(e) => {
                          if (e.target.checked) setNewDutyFlights([...newDutyFlights, flt as FlightName]);
                          else setNewDutyFlights(newDutyFlights.filter(f => f !== flt));
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
                        checked={newDutyRanks.includes(rank as Rank)} 
                        onChange={(e) => {
                          if (e.target.checked) setNewDutyRanks([...newDutyRanks, rank as Rank]);
                          else setNewDutyRanks(newDutyRanks.filter(r => r !== rank));
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{rank}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <button onClick={() => setIsAddingNewDuty(false)} className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!newDutyName.trim()) return;
                  const newCode = 'CUST_' + Date.now().toString();
                  const newCustomDuty: CustomDutyConfig = {
                    code: newCode as DutyCategoryCode,
                    name: newDutyName,
                    shortName: newDutyName.substring(0, 4).toUpperCase(),
                    category: 'Special',
                    color: 'bg-indigo-600 text-white',
                    badgeBg: 'bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700',
                    badgeText: 'text-indigo-800 dark:text-indigo-300',
                    isCountedAsDuty: true,
                    description: newDutyName,
                    isCustom: true,
                    eligibleFlights: newDutyFlights,
                    eligibleRanks: newDutyRanks
                  };
                  
                  // Add globally
                  addCustomDuty(newCustomDuty);
                  
                  // Add to matrix
                  if (matrix && onMatrixChange) {
                    const newMatrix = [...matrix];
                    newMatrix.push({
                      id: newCode,
                      title: newDutyName,
                      dutyCode: newCode as DutyCategoryCode,
                      totalRequiredMonth: 0,
                      totalRequiredDaily: 0,
                      eligibleFlights: newDutyFlights,
                      eligibleRanks: newDutyRanks,
                      data: {
                        Mechanics: Array(31).fill(0),
                        Avionics: Array(31).fill(0),
                        GCS: Array(31).fill(0),
                        Admin: Array(31).fill(0),
                      }
                    });
                    onMatrixChange(newMatrix);
                  }
                  
                  setIsAddingNewDuty(false);
                }}
                disabled={!newDutyName.trim()}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md rounded-xl transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('isAddingNewDuty && (')) {
    code = code.replace(/    <\/div>\n  \);\n};\n?$/, modalHtml + '    </div>\n  );\n};\n');
    fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
    console.log("Modal added");
} else {
    console.log("Modal already added");
}
