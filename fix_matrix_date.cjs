const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const stateHookStr = `  const [viewMode, setViewMode] = useState<'DUTY_DISTRIBUTION' | 'DUTY_RATIO' | 'MANPOWER' | 'DUTY_LIST'>('DUTY_RATIO');`;
const newStates = `  const [viewMode, setViewMode] = useState<'DUTY_DISTRIBUTION' | 'DUTY_RATIO' | 'MANPOWER' | 'DUTY_LIST'>('DUTY_RATIO');
  const [targetDate, setTargetDate] = useState(() => {
    const saved = localStorage.getItem('baf_duty_distribution_target_date');
    if (saved) return saved;
    const now = new Date();
    // Use local date properly
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  });

  useEffect(() => {
    localStorage.setItem('baf_duty_distribution_target_date', targetDate);
  }, [targetDate]);`;

code = code.replace(stateHookStr, newStates);

const renderStr = `    {/* TAB NAVIGATION */}
    <div className="flex flex-wrap space-x-1 sm:space-x-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl w-full max-w-3xl mt-4">`;

const newRenderStr = `    {/* LAST UPDATING DATE */}
    <div className="flex flex-col items-center justify-center mt-6 w-full max-w-3xl">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Updating Date</div>
      <input 
        type="date"
        value={targetDate}
        onChange={(e) => setTargetDate(e.target.value)}
        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-bold text-indigo-700 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 shadow-sm"
      />
    </div>

    {/* TAB NAVIGATION */}
    <div className="flex flex-wrap space-x-1 sm:space-x-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl w-full max-w-3xl mt-4">`;

code = code.replace(renderStr, newRenderStr);

const panelRenderStr = `<DutyRatioConfigPanel activeTab={viewMode as any} matrix={matrix} onMatrixChange={handleRatioCalculated} />`;
const newPanelRenderStr = `<DutyRatioConfigPanel activeTab={viewMode as any} matrix={matrix} onMatrixChange={handleRatioCalculated} targetDate={targetDate} />`;

code = code.replace(panelRenderStr, newPanelRenderStr);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
