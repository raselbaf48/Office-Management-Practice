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
// Because of global replacement, I need to do a replace loop or careful regex if there are multiple. Wait, the `handleResetTable` is inside a map. Let's use string replacement.
fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
