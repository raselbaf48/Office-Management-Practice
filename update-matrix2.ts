import fs from 'fs';

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const searchHeader = "{/* Filter and Search Bar */}";
const tabsUI = `{/* View Mode Tabs */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-200 dark:border-slate-800 mb-4">
        <button
          onClick={() => setViewMode('BASE_DUTIES')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'BASE_DUTIES'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Shield className="w-4 h-4" />
          <span>Base Duties</span>
        </button>

        <button
          onClick={() => setViewMode('IDAC_DUTY')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'IDAC_DUTY'
              ? 'bg-blue-700 text-white shadow-blue-700/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Clock className="w-4 h-4" />
          <span>IDAC Duty</span>
        </button>
      </div>

      {/* Filter and Search Bar */}`;

code = code.replace(searchHeader, tabsUI);
fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
