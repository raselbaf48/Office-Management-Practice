const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

if (!code.includes('dateMode')) {
  code = code.replace(/const \[activePreset, setActivePreset\] = useState<'today' \| '7days' \| '15days' \| 'month' \| 'custom'>\('today'\);/,
  `$&
  const [dateMode, setDateMode] = useState<'single' | 'multi'>('single');`);
}

// Replace the date filter section
const searchFor = `{/* From / To Date Filter */}`;
const replaceWith = `{/* Date Mode Toggle & Pickers */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  onClick={() => {
                    setDateMode('single');
                    setToDate(fromDate);
                    setActivePreset('today');
                  }}
                  className={\`px-3 py-1.5 rounded-lg transition-all \${dateMode === 'single' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}\`}
                >
                  Single Dt
                </button>
                <button
                  onClick={() => setDateMode('multi')}
                  className={\`px-3 py-1.5 rounded-lg transition-all \${dateMode === 'multi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}\`}
                >
                  Multi Dt
                </button>
              </div>

              {dateMode === 'single' ? (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <span className="text-slate-500 font-semibold mr-2">Dt:</span>
                  <DateNavigator
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setToDate(e.target.value);
                      setSelectedDate(e.target.value);
                      setActivePreset('custom');
                    }}
                    className="bg-transparent text-slate-900 dark:text-white print:text-black font-black outline-none cursor-pointer"
                  />
                </div>
              ) : (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold space-x-2">
                  <span className="text-slate-500 font-semibold">From:</span>
                  <DateNavigator
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setSelectedDate(e.target.value);
                    }}
                    className="bg-transparent text-slate-900 dark:text-white print:text-black font-black outline-none cursor-pointer"
                  />
                  <span className="text-slate-400 font-semibold">To:</span>
                  <DateNavigator
                    value={toDate}
                    min={fromDate}
                    onChange={(e) => { setToDate(e.target.value); setActivePreset('custom'); }}
                    className="bg-transparent text-slate-900 dark:text-white print:text-black font-black outline-none cursor-pointer"
                  />
                </div>
              )}
            </div>`;

code = code.replace(/\{\/\* From \/ To Date Filter \*\/\}.*?<\/div>/s, replaceWith);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
