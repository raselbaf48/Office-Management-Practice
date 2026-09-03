const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

// Replace the Actions div end to include the tabs
const tabNav = `      </div>
    </div>

    {/* TAB NAVIGATION */}
    <div className="flex flex-wrap space-x-1 sm:space-x-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl w-full max-w-3xl mt-4">
      <button 
        onClick={() => setViewMode('TOTAL_DUTY')}
        className={\`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-lg transition-colors \${viewMode === 'TOTAL_DUTY' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}\`}
      >Total Duty</button>
      <button 
        onClick={() => setViewMode('MANPOWER')}
        className={\`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-lg transition-colors \${viewMode === 'MANPOWER' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}\`}
      >Manpower</button>
      <button 
        onClick={() => setViewMode('DUTY_DISTRIBUTION')}
        className={\`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-lg transition-colors \${viewMode === 'DUTY_DISTRIBUTION' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}\`}
      >Distribution</button>
      <button 
        onClick={() => setViewMode('DUTY_RATIO')}
        className={\`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold rounded-lg transition-colors \${viewMode === 'DUTY_RATIO' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}\`}
      >Duty Ratio</button>
    </div>
    </div>`;

code = code.replace(
  '        </button>\n      </div>\n    </div>\n    </div>',
  '        </button>\n      </div>\n    </div>\n' + tabNav
);

code = code.replace(
  '<DutyRatioConfigPanel \n          onRatioCalculated={handleRatioCalculated}\n        />',
  `{viewMode !== 'DUTY_RATIO' && (
          <DutyRatioConfigPanel activeTab={viewMode as any} />
        )}`
);

code = code.replace(
  '{matrix.map((table, tableIdx) => {',
  '{viewMode === \'DUTY_RATIO\' && matrix.map((table, tableIdx) => {'
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
