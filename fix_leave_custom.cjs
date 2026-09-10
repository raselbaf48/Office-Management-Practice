const fs = require('fs');
const file = 'src/components/AssignLeaveTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `            <div className="grid grid-cols-6 gap-1.5">
              {[3, 4, 7, 15, 21, 30].map((days) => {
                const isSelected = selectedPresetDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handlePresetToggle(days)}
                    className={\`py-1.5 px-1 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs text-center border \${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/50 shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300'
                    }\`}
                  >
                    {days} Days
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-slate-700/60 p-2 rounded-xl border border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Custom Leave:
                </span>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={customLeaveDays}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      handleCustomLeaveDaysChange(val);
                    }}
                    className="w-16 px-2 py-1 text-xs font-black text-center bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 font-semibold">Days</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCustomLeaveDaysChange(customLeaveDays)}
                className={\`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer \${
                  isCustomPresetActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200'
                }\`}
              >
                {isCustomPresetActive ? '✓ Custom Set' : 'Apply Custom'}
              </button>
            </div>`;

const replaceCode = `            <div className="flex flex-wrap items-center gap-1.5">
              {[3, 4, 7, 15, 21, 30].map((days) => {
                const isSelected = selectedPresetDays === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handlePresetToggle(days)}
                    className={\`py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs text-center border \${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/50 shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300'
                    }\`}
                  >
                    {days} Days
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => { setSelectedPresetDays(null); setIsCustomPresetActive(true); handleCustomLeaveDaysChange(customLeaveDays); }}
                className={\`py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs text-center border \${
                  isCustomPresetActive
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/50 shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300'
                }\`}
              >
                Custom
              </button>
              
              {isCustomPresetActive && (
                <div className="flex items-center space-x-1 ml-1 animate-fadeIn">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={customLeaveDays}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      handleCustomLeaveDaysChange(val);
                    }}
                    className="w-14 px-2 py-1 text-xs font-black text-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-slate-500 font-semibold">Days</span>
                </div>
              )}
            </div>`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched Custom Leave Design in AssignLeaveTab!");
