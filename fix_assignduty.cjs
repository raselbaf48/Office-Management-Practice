const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const handleShiftDate = \(days: number\) => \{\s*if \(\!fromDate\) return;\s*const d = new Date\(fromDate\);\s*d.setDate\(d.getDate\(\) \+ days\);\s*const newDate = d.toISOString\(\).split\('T'\)\[0\];\s*setFromDate\(newDate\);\s*setToDate\(newDate\);\s*\};/g,
  `const handleShiftDate = (days: number) => {
    if (!fromDate) return;
    const d = new Date(fromDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    setFromDate(newDate);
    if (selectedPresetDays !== null) {
      const td = new Date(newDate);
      td.setDate(td.getDate() + selectedPresetDays - 1);
      setToDate(td.toISOString().split('T')[0]);
    } else {
      if (toDate < newDate) setToDate(newDate);
    }
  };`
);

code = code.replace(
  /if \(selectedPresetDays === 1\) \{\s*if \(e.key === 'ArrowRight'\) \{\s*handleShiftDate\(1\);\s*\} else if \(e.key === 'ArrowLeft'\) \{\s*handleShiftDate\(-1\);\s*\}\s*\}/g,
  `if (e.key === 'ArrowRight') {
          handleShiftDate(1);
        } else if (e.key === 'ArrowLeft') {
          handleShiftDate(-1);
        }`
);

code = code.replace(
  /\{selectedPresetDays === 1 && \(\s*<button\s*type="button"\s*onClick=\{\(\) => handleShiftDate\(-1\)\}\s*className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"\s*title="Previous Date \(Left Arrow Key\)"\s*>\s*<ChevronLeft className="w-4 h-4" \/>\s*<\/button>\s*\)\}/g,
  `<button
                  type="button"
                  onClick={() => handleShiftDate(-1)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                  title="Previous Date (Left Arrow Key)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>`
);

code = code.replace(
  /\{selectedPresetDays === 1 && \(\s*<button\s*type="button"\s*onClick=\{\(\) => handleShiftDate\(1\)\}\s*className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"\s*title="Next Date \(Right Arrow Key\)"\s*>\s*<ChevronRight className="w-4 h-4" \/>\s*<\/button>\s*\)\}/g,
  `<button
                  type="button"
                  onClick={() => handleShiftDate(1)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                  title="Next Date (Right Arrow Key)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>`
);


fs.writeFileSync(file, code);
console.log('Fixed AssignDutyModal');
