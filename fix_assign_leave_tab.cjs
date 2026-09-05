const fs = require('fs');

let file = 'src/components/AssignLeaveTab.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Update the state initialization
code = code.replace(
  /const \[leaveType, setLeaveType\] = useState<'Casual' \| 'Annual' \| 'Recreation'>\('Casual'\);/,
  `const [leaveType, setLeaveType] = useState<'Casual' | 'Annual' | 'Recreation' | 'Sick' | ''>('');`
);

// 2. Update the effect logic
code = code.replace(
  /\/\/ Auto-select Leave Type based on duration\s*useEffect\(\(\) => \{\s*if \(leaveDurationDays <= 10\) \{\s*setLeaveType\('Casual'\);\s*\} else if \(leaveType === 'Casual'\) \{\s*setLeaveType\('Annual'\);\s*\}\s*\}, \[leaveDurationDays\]\);/,
  `// Auto-select Leave Type based on duration
  useEffect(() => {
    setLeaveType((prev) => {
      if (leaveDurationDays > 10) {
        if (prev === 'Casual' || prev === '') return 'Annual';
        return prev;
      }
      if (leaveDurationDays <= 10) {
        if (prev === '') return 'Casual';
        return prev;
      }
      return prev;
    });
  }, [leaveDurationDays]);`
);

// 3. Update the type logic in preset auto date
code = code.replace(
  /if \(baseDays > 10 && leaveType === 'Casual'\) \{\s*setLeaveType\('Annual'\);\s*\}/,
  `if (baseDays > 10 && leaveType === 'Casual') {
        setLeaveType('Annual');
      }`
);

// 4. Update fullTypeName logic
code = code.replace(
  /const fullTypeName = leaveType === 'Casual' \? 'Casual Leave' : leaveType === 'Annual' \? 'Annual Leave' : 'Recreation Leave';/,
  `const fullTypeName = leaveType === 'Casual' ? 'Casual Leave' : leaveType === 'Annual' ? 'Annual Leave' : leaveType === 'Sick' ? 'Sick Leave' : leaveType === 'Recreation' ? 'Recreation Leave' : 'Leave';`
);

// 5. Submit button disable logic
code = code.replace(
  /disabled=\{saving \|\| !leaveFromDate \|\| !leaveToDate\}/,
  `disabled={saving || !leaveFromDate || !leaveToDate || !leaveType}`
);

// 6. Update the UI block
const startMarker = '{/* Leave Type Section */}';
const endMarker = 'Duration is &gt; 10 days: select either Annual Leave or Recreation Leave.\n                </p>\n              </div>\n            )}';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const fullEndIndex = endIndex + endMarker.length;
  
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
                disabled={leaveDurationDays > 10}
                onClick={() => setLeaveType('Casual')}
                className={\`py-2 text-xs font-black rounded-xl border transition-all \${
                  leaveDurationDays > 10 ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700' :
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
            {leaveDurationDays > 10 ? (
              <p className="text-[10.5px] text-slate-400">
                Duration is &gt; 10 days: Casual Leave disabled. Selected {leaveType || 'None'}.
              </p>
            ) : (
              <p className="text-[10.5px] text-slate-400">
                Duration is &le; 10 days: Casual Leave auto-selected. Selected {leaveType || 'None'}.
              </p>
            )}`;
  
  code = code.substring(0, startIndex) + newUI + code.substring(fullEndIndex);
  fs.writeFileSync(file, code);
  console.log("Successfully replaced AssignLeaveTab UI.");
} else {
  console.log("Failed to find start/end markers in AssignLeaveTab.tsx", startIndex, endIndex);
}

