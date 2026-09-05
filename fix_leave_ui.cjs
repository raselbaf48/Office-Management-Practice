const fs = require('fs');

let file = 'src/components/LeaveRegisterView.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the UI block for Leave Type Section
const uiRegex = /\{\/\* Leave Type Section \(Auto-Select <=10 days => Casual Leave, >10 days => Annual\/Recreation options\) \*\/\}\s*<div>[\s\S]*?Duration is &gt; 10 days: select either Annual Leave or Recreation Leave\.\s*<\/p>\s*<\/div>\s*\}\)\s*<\/div>/;

const newUI = `{/* Leave Type Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Leave Type
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Duration: {leaveDurationDays} Day{leaveDurationDays > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-1.5">
                  <button
                    type="button"
                    disabled={leaveDurationDays >= 10}
                    onClick={() => setLeaveType('Casual')}
                    className={\`py-2 text-xs font-black rounded-xl border transition-all \${
                      leaveDurationDays >= 10 ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700' :
                      leaveType === 'Casual'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs cursor-pointer'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 cursor-pointer'
                    }\`}
                  >
                    Casual Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('Annual')}
                    className={\`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer \${
                      leaveType === 'Annual'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }\`}
                  >
                    Annual Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('Recreation')}
                    className={\`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer \${
                      leaveType === 'Recreation'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }\`}
                  >
                    Recreation Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType('Sick')}
                    className={\`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer \${
                      leaveType === 'Sick'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }\`}
                  >
                    Sick Leave
                  </button>
                </div>
                {leaveDurationDays >= 10 ? (
                  <p className="text-[10.5px] text-slate-400">
                    Duration is ≥ 10 days: Casual Leave disabled. Selected {leaveType || 'None'}.
                  </p>
                ) : (
                  <p className="text-[10.5px] text-slate-400">
                    Duration is &lt; 10 days: Casual Leave auto-selected. Selected {leaveType || 'None'}.
                  </p>
                )}
              </div>`;

code = code.replace(uiRegex, newUI);

// The auto-select effect needs one minor adjustment. If leaveDurationDays < 10, it should auto select Casual. If >= 10, auto select Annual. 
// BUT it should only do it if the user hasn't overridden it, or if it changed boundary. 
// The easiest way is to just set it on change of duration.

code = code.replace(
  /\/\/ Auto-select Leave Type based on duration[\s\S]*?\}, \[leaveDurationDays\]\);/,
  `// Auto-select Leave Type based on duration
  useEffect(() => {
    if (leaveDurationDays < 10) {
      setLeaveType('Casual');
    } else if (leaveDurationDays >= 10) {
      setLeaveType('Annual');
    }
  }, [leaveDurationDays]);`
);

// We need to disable the submit button if leaveType is empty
code = code.replace(
  /disabled=\{savingLeave \|\| !leaveAirmanId \|\| !leaveFromDate \|\| !leaveToDate\}/,
  `disabled={savingLeave || !leaveAirmanId || !leaveFromDate || !leaveToDate || !leaveType}`
);

fs.writeFileSync(file, code);
