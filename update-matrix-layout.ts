import fs from 'fs';

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// 1. Update viewMode state
code = code.replace(
  "const [viewMode, setViewMode] = useState<'BASE_DUTIES' | 'IDAC_DUTY'>('BASE_DUTIES');",
  "const [viewMode, setViewMode] = useState<'DUTY_DISTRIBUTION' | 'DUTY_RATIO' | 'MANPOWER' | 'TOTAL_DUTY'>('DUTY_DISTRIBUTION');"
);

// 2. Remove the flex-row split structure
const layoutToReplace = `<div className="flex flex-col xl:flex-row gap-6 pb-12 animate-fadeIn">
      {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <div className="w-full xl:w-[45%] 2xl:w-[40%] flex-shrink-0">
          <div className="sticky top-6 h-[calc(100vh-100px)] flex flex-col overflow-hidden">
            <DutyRatioConfigPanel />
          </div>
        </div>
      )}
      
      <div className="flex-1 space-y-6 w-full xl:w-[55%] 2xl:w-[60%] overflow-x-auto pb-8 custom-scrollbar">`;

const newLayout = `<div className="w-full max-w-7xl mx-auto pb-12 animate-fadeIn space-y-6">`;

code = code.replace(layoutToReplace, newLayout);

// Need to remove the two closing divs at the very bottom of the file
const bottomHtml = `        </div>
      </div>

      <ImportDutyRatioModal`;
const newBottomHtml = `        </div>

      <ImportDutyRatioModal`;
code = code.replace(bottomHtml, newBottomHtml);

// 3. Remove the View Mode Tabs from the middle of the code and replace with nothing (or empty)
const oldTabsRegex = /\{\/\* View Mode Tabs \*\/\}.*?\{\/\* Filter and Search Bar \*\/\}/s;
code = code.replace(oldTabsRegex, '{/* Filter and Search Bar */}');

// 4. Update the View Mode Tabs right after the banner
const bannerHeaderRegex = /<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">.*?<\/div>\n.*?<\/div>/s;
const match = code.match(bannerHeaderRegex);
if (match) {
  const newTabsHTML = `
      {/* View Mode Tabs */}
      <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setViewMode('DUTY_DISTRIBUTION')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'DUTY_DISTRIBUTION'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Layers className="w-4 h-4" />
          <span>Duty Distribution</span>
        </button>
        
        <button
          onClick={() => setViewMode('DUTY_RATIO')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'DUTY_RATIO'
              ? 'bg-blue-600 text-white shadow-blue-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Shield className="w-4 h-4" />
          <span>Duty Ratio</span>
        </button>

        <button
          onClick={() => setViewMode('MANPOWER')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'MANPOWER'
              ? 'bg-amber-500 text-white shadow-amber-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Manpower</span>
        </button>

        <button
          onClick={() => setViewMode('TOTAL_DUTY')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'TOTAL_DUTY'
              ? 'bg-purple-600 text-white shadow-purple-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Calendar className="w-4 h-4" />
          <span>Total Duty</span>
        </button>
      </div>
      
      {viewMode !== 'DUTY_RATIO' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
          <DutyRatioConfigPanel activeTab={viewMode} />
        </div>
      ) : (
        <div className="space-y-6">
  `;
  code = code.replace(match[0], match[0] + newTabsHTML);
}

// And close the "viewMode === 'DUTY_RATIO'" section just before the ImportModal
const closingRegex = /<\/div>\n\n\s*<ImportDutyRatioModal/s;
code = code.replace(closingRegex, `</div>\n\n        </div>\n      )}\n\n      <ImportDutyRatioModal`);

// Wait, the previous matrix filter had this:
const newFilter = `matrix
          .filter((t) => {
            const isIdac = t.id.startsWith('idac_');
            if (viewMode === 'BASE_DUTIES' && isIdac) return false;
            if (viewMode === 'IDAC_DUTY' && !isIdac) return false;
            return true;
          })`;
const allDutiesFilter = `matrix`;

code = code.replace(newFilter, allDutiesFilter);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
