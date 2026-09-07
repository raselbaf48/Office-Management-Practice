const fs = require('fs');
let code = fs.readFileSync('src/components/FlightDutyCalendarModal.tsx', 'utf8');

// Replace the grid button rendering to use circles and center the number
const targetBtnStart = `              return (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  className={\`relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all \${`;

const newBtnStart = `              return (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  className={\`relative aspect-square rounded-full border-2 flex flex-col items-center justify-center transition-all \${`;

code = code.replace(targetBtnStart, newBtnStart);

const targetContent = `                  {requirement > 0 && (
                    <div className={\`absolute top-1 right-1 text-[8px] font-black px-1 rounded shadow-sm \${
                      isOverFulfilled ? 'bg-rose-500 text-white dark:bg-rose-600' :
                      isFulfilled ? 'bg-emerald-500 text-white dark:bg-emerald-600' : 
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                    }\`}>
                      {totalAssigned}/{requirement}
                    </div>
                  )}

                  <span
                    className={\`text-[10px] font-bold mb-0.5 mt-2 \${
                      isPositive ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'
                    }\`}
                  >
                    {i + 1}
                  </span>

                  <div className="flex items-center justify-center h-5 w-full mt-1">
                    {val > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <div className="flex space-x-0.5">
                          {Array.from({ length: val }).map((_, ci) => (
                            <div key={ci} className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm"></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </button>`;

const newContent = `                  {requirement > 0 && (
                    <div className={\`absolute -top-1 -right-1 text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm border \${
                      isOverFulfilled ? 'bg-rose-500 border-rose-600 text-white dark:bg-rose-600' :
                      isFulfilled ? 'bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-600' : 
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                    }\`}>
                      {totalAssigned}/{requirement}
                    </div>
                  )}

                  <span
                    className={\`text-sm font-black \${
                      isPositive ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'
                    }\`}
                  >
                    {i + 1}
                  </span>

                  <div className="flex items-center justify-center h-2 w-full mt-0.5">
                    {val > 0 && (
                      <div className="flex items-center space-x-1.5">
                        <div className="flex space-x-0.5">
                          {Array.from({ length: val }).map((_, ci) => (
                            <div key={ci} className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-sm"></div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </button>`;

code = code.replace(targetContent, newContent);

fs.writeFileSync('src/components/FlightDutyCalendarModal.tsx', code, 'utf8');
console.log('Successfully patched circle calendar');
