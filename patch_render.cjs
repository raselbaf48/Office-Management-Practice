const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="space-y-1">
                          {shiftAssigned.length === 0 ? (
                            <span className={\`text-[10.5px] italic \${isShiftSelected ? 'text-teal-100' : 'text-slate-400'}\`}>
                              — None Assigned
                            </span>
                          ) : (
                            shiftAssigned.map((item, idx) => (
                              <div
                                key={\`\${item.airman.id}-\${s}-\${idx}\`}
                                className={\`text-[11px] px-2 py-1 rounded-lg font-bold truncate \${
                                  isShiftSelected ? 'bg-teal-700/90 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                                }\`}
                                title={\`\${item.airman.rank} \${item.airman.name} (\${item.airman.flightName})\`}
                              >
                                <span className="opacity-70 mr-1.5">{idx + 1}.</span>
                                {item.airman.rank} {item.airman.name}
                                <span className="ml-1 opacity-75 font-normal text-[10px]">
                                  ({item.airman.flightName})
                                </span>
                              </div>
                            ))
                          )}
                        </div>`;

const replacementStr = `<div className="space-y-1">
                          {shiftAssigned.length === 0 && unfulfilledFlights.length === 0 ? (
                            <span className={\`text-[10.5px] italic \${isShiftSelected ? 'text-teal-100' : 'text-slate-400'}\`}>
                              — None Assigned
                            </span>
                          ) : (
                            <>
                              {shiftAssigned.map((item, idx) => (
                                <div
                                  key={\`\${item.airman.id}-\${s}-\${idx}\`}
                                  className={\`text-[11px] px-2 py-1 rounded-lg font-bold truncate \${
                                    isShiftSelected ? 'bg-teal-700/90 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                                  }\`}
                                  title={\`\${item.airman.rank} \${item.airman.name} (\${item.airman.flightName})\`}
                                >
                                  <span className="opacity-70 mr-1.5">{idx + 1}.</span>
                                  {item.airman.rank} {item.airman.name}
                                  <span className="ml-1 opacity-75 font-normal text-[10px]">
                                    ({item.airman.flightName})
                                  </span>
                                </div>
                              ))}
                              {unfulfilledFlights.map((flt, fltIdx) => (
                                <div
                                  key={\`unfulfilled-\${s}-\${fltIdx}\`}
                                  className={\`text-[11px] px-2 py-1 rounded-lg font-bold truncate border border-dashed \${
                                    isShiftSelected ? 'bg-teal-800/40 text-teal-200 border-teal-500/50' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-slate-700'
                                  }\`}
                                >
                                  <span className="opacity-70 mr-1.5">{shiftAssigned.length + fltIdx + 1}.</span>
                                  Not Assigned
                                  <span className="ml-1 opacity-75 font-normal text-[10px]">
                                    ({flt})
                                  </span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Patched render block!");
} else {
  console.log("Could not find targetStr");
}
