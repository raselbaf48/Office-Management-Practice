const fs = require('fs');
let file = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// 1. Remove settings button
const settingsBtnTarget = `                      <button
                        onClick={() => setSettingsTableIdx(tableIdx)}
                        title="Duty Settings"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                      </button>`;
if (file.includes(settingsBtnTarget)) {
    file = file.replace(settingsBtnTarget, "");
    console.log("Settings button removed");
}

// 2. Add Edit in Calendar for specific flight view
const singleFlightTdTarget = `<td className="p-2 text-left font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 align-middle text-[11px] leading-tight">
                          {table.title}
                        </td>`;

const singleFlightTdReplacement = `<td className="p-2 text-left font-bold text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 align-middle text-[11px] leading-tight">
                          <div className="flex items-center justify-between">
                            <span>{table.title}</span>
                            {(role === 'ADMIN' || role === 'SUPER_ADMIN') ? (
                              <button
                                onClick={() => setEditingCalendar({ tableIdx, flight: selectedFlightFilter as import('../types').FlightName })}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-500 transition-colors cursor-pointer ml-2"
                                title="Edit in Calendar"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
                            )}
                          </div>
                        </td>`;

if (file.includes(singleFlightTdTarget)) {
    file = file.replace(singleFlightTdTarget, singleFlightTdReplacement);
    console.log("Edit in Calendar added for filtered view");
}

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', file);
