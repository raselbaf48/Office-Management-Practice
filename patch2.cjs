const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `            <div className="flex items-center space-x-2">
              <input`;

const replacementStr = `            <div className="flex items-center space-x-2">
              {dateMode === 'single' && (
                <button
                  type="button"
                  onClick={() => handleShiftDate(-1)}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Previous Date (Left Arrow Key)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <input`;

content = content.replace(targetStr, replacementStr);

const targetStr2 = `                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
              />
              {dateMode === 'multi' && (`;

const replacementStr2 = `                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
              />
              {dateMode === 'single' && (
                <button
                  type="button"
                  onClick={() => handleShiftDate(1)}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Next Date (Right Arrow Key)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {dateMode === 'multi' && (`;

content = content.replace(targetStr2, replacementStr2);

fs.writeFileSync(file, content);
