import fs from 'fs';

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// 1. Add Clock to lucide-react imports
code = code.replace(/CheckCircle2\n\} from 'lucide-react';/, "CheckCircle2,\n  Clock\n} from 'lucide-react';");

// 2. Add viewMode state
code = code.replace(
  "const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);",
  "const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);\n  const [viewMode, setViewMode] = useState<'BASE_DUTIES' | 'IDAC_DUTY'>('BASE_DUTIES');"
);

// 3. Filter matrix in render based on viewMode
// The existing filter looks like this:
// {matrix
//   .filter((t) =>
//     t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
//     t.id.toLowerCase().includes(filterQuery.toLowerCase())
//   )
//   .map((table, tableIdx) => {

const currentFilter = `{matrix
          .filter((t) =>
            t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(filterQuery.toLowerCase())
          )`;

const newFilter = `{matrix
          .filter((t) => {
            const isIdac = t.id.startsWith('idac_');
            if (viewMode === 'BASE_DUTIES' && isIdac) return false;
            if (viewMode === 'IDAC_DUTY' && !isIdac) return false;
            return true;
          })
          .filter((t) =>
            t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(filterQuery.toLowerCase())
          )`;

code = code.replace(currentFilter, newFilter);

// 4. Add the View Tabs UI right before the existing filter options (e.g. above the Search input)
// The search input starts like:
// <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">

const searchHeader = `<div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">`;
const tabsUI = `      {/* View Mode Tabs */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-200 dark:border-slate-800">
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

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">`;

code = code.replace(searchHeader, tabsUI);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
