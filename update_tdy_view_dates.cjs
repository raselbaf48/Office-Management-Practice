const fs = require('fs');
const file = 'src/components/TdyRegisterView.tsx';

let code = fs.readFileSync(file, 'utf8');

const dateRegex = /\{\/\* Date Range \*\/\}([\s\S]*?)\{\/\* Buttons \*\/\}/;

const newDate = `{/* Assignment Date Presets */}
              <div>
                 <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                    Assignment Date
                  </label>
                 <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {[{label: 'Today', val: 1}, {label: '2 Days', val: 2}, {label: '3 Days', val: 3}, {label: '7 Days', val: 7}, {label: '15 Days', val: 15}].map((opt) => {
                    const isSelected = selectedPresetDays === opt.val;
                    return (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          setSelectedPresetDays(opt.val);
                          if (tdyFromDate) {
                            const d = new Date(tdyFromDate);
                            d.setDate(d.getDate() + opt.val - 1);
                            setTdyToDate(d.toISOString().split('T')[0]);
                          }
                        }}
                        className={\`py-1.5 px-1 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs text-center border \${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/50 shadow-sm'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300'
                        }\`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range (Dynamic based on Preset) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    From Date
                  </label>
                  <DateNavigator
                    value={tdyFromDate}
                    onChange={(e) => {
                      setTdyFromDate(e.target.value);
                      if (tdyToDate < e.target.value) setTdyToDate(e.target.value);
                      
                      // Keep To Date in sync if it's a single day selection
                      if (selectedPresetDays === 1) {
                          setTdyToDate(e.target.value);
                      } else if (selectedPresetDays !== null) {
                          const d = new Date(e.target.value);
                          d.setDate(d.getDate() + selectedPresetDays - 1);
                          setTdyToDate(d.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                  />
                </div>
                
                {/* Show To Date only if > 1 day selected, or if user is manually overriding */}
                {selectedPresetDays !== 1 && (
                    <div className="animate-fadeIn">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        To Date
                      </label>
                      <DateNavigator
                        value={tdyToDate}
                        min={tdyFromDate}
                        onChange={(e) => {
                          setTdyToDate(e.target.value);
                          setSelectedPresetDays(null); // Custom end date removes preset
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                      />
                    </div>
                )}
              </div>

              {/* Real-time Duration Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 mt-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total TDY Span:</span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {tdyDurationDays} Calendar Day{tdyDurationDays > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Buttons */}`;

code = code.replace(dateRegex, newDate);

// ensure initial state for selectedPresetDays is 1
code = code.replace('const [selectedPresetDays, setSelectedPresetDays] = useState<number | null>(null);', 'const [selectedPresetDays, setSelectedPresetDays] = useState<number | null>(1);');

fs.writeFileSync(file, code);
console.log("Updated TdyRegisterView.tsx dates");
