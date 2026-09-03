const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

// 1. Add states for table info and settings modal
code = code.replace(
  "const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);",
  `const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [showTableInfo, setShowTableInfo] = useState<Record<number, boolean>>({});
  const [settingsTableIdx, setSettingsTableIdx] = useState<number | null>(null);

  const toggleTableInfo = (idx: number) => setShowTableInfo(prev => ({ ...prev, [idx]: !prev[idx] }));`
);

// 2. Add Settings icon import
code = code.replace(
  "Info,",
  "Info,\n  Settings,"
);

// 3. Update the header of each table (Reset Table -> Settings and Info)
code = code.replace(
  /<button[\s\S]*?onClick=\{\(\) => handleResetTable\(tableIdx\)\}[\s\S]*?<\/button>/,
  `<button
                        onClick={() => toggleTableInfo(tableIdx)}
                        title="Toggle Target/Requirement Info"
                        className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${showTableInfo[tableIdx] ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 hover:bg-white/20 text-white'}\`}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSettingsTableIdx(tableIdx)}
                        title="Duty Settings"
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                      </button>`
);

// The headers columns
code = code.replace(
  /<th className="p-2 w-16 min-w-16 font-bold bg-slate-200\/60 dark:bg-slate-700\/60 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*Total\s*<\/th>\s*<th className="p-2 w-24 min-w-24 font-bold bg-slate-200\/60 dark:bg-slate-700\/60 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*As Per Ratio\s*<\/th>/g,
  `{showTableInfo[tableIdx] ? (
                          <th className="p-2 w-28 min-w-28 font-bold bg-slate-200/60 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700 text-center align-middle leading-tight">
                            Total / Ratio
                          </th>
                        ) : (
                          <th className="p-2 w-16 min-w-16 font-bold bg-slate-200/60 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700 text-center align-middle">
                            Total
                          </th>
                        )}`
);

// The row cells
code = code.replace(
  /<td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*\{rowSum\}\s*<\/td>\s*<td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-center align-middle">\s*\{table\.flightTargets\?\.\[flight\] \|\| 0\}\s*<\/td>/g,
  `{showTableInfo[tableIdx] ? (
                                <td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-center align-middle">
                                  <div className="flex items-center justify-center space-x-1 text-[11px]">
                                    <span className={rowSum !== (table.flightTargets?.[flight] || 0) ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}>{rowSum}</span>
                                    <span className="text-slate-400">/</span>
                                    <span className="text-slate-600 dark:text-slate-400">{table.flightTargets?.[flight] || 0}</span>
                                  </div>
                                </td>
                              ) : (
                                <td className="p-2 font-mono font-bold bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-center align-middle text-slate-800 dark:text-slate-200">
                                  {rowSum}
                                </td>
                              )}`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
