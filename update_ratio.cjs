const fs = require('fs');

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// 1. Add Settings state
code = code.replace(
  /const \[isImportModalOpen, setIsImportModalOpen\] = useState<boolean>\(false\);/,
  "const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);\n  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);"
);

// 2. Add Settings button in Actions
code = code.replace(
  /<div className="flex flex-wrap items-center gap-2 self-end md::self-auto">/,
  `<div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          {role === 'ADMIN' && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              title="Duty Settings & Targets"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}`
);

// Note: The previous replacement regex was slightly wrong, let's fix it by matching the exact string:
code = code.replace(
  /<div className="flex flex-wrap items-center gap-2 self-end md:self-auto">/,
  `<div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          {role === 'ADMIN' && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Duty Targets Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}`
);


// 3. Add Settings Modal at the end of the file before `</div>`
const modalHtml = `
      {/* Duty Targets Settings Modal */}
      {isSettingsOpen && role === 'ADMIN' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Duty Targets Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <p className="text-xs text-slate-500 mb-4">
                Configure the Monthly and Daily target requirements for each duty type. 
                This will update the total required slots shown in the matrix headers.
              </p>
              
              {matrix.map((table, tIdx) => (
                <div key={table.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="col-span-12 sm:col-span-6">
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{table.title}</div>
                    <div className="text-[10px] text-slate-500">Code: {table.dutyCode} {table.shiftLabel ? \`(\${table.shiftLabel})\` : ''}</div>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Daily Target</label>
                    <input
                      type="number"
                      value={table.totalRequiredDaily || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newMatrix = [...matrix];
                        newMatrix[tIdx].totalRequiredDaily = val;
                        setMatrix(newMatrix);
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Monthly Target</label>
                    <input
                      type="number"
                      value={table.totalRequiredMonth || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newMatrix = [...matrix];
                        newMatrix[tIdx].totalRequiredMonth = val;
                        setMatrix(newMatrix);
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                onClick={() => {
                  saveDutyMatrix(matrix);
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 2500);
                  setIsSettingsOpen(false);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save & Apply Targets
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  /<\/div>\s*<ImportDutyRatioModal/,
  modalHtml + '\n    </div>\n    <ImportDutyRatioModal'
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
