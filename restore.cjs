const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

const replacement = `<button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
              title="Import Duty Ratio from CSV or Excel file"
            >
              <Upload className="w-4 h-4" />
              <span>Import Ratio</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
              title="Reset to Official Defaults"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </>
        ) : (
          <button
            onClick={onRequestAdminAccess}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-2"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Request Edit Access</span>
          </button>
        )}

        <button
          onClick={handleSave}
          className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span className="hidden sm:inline">{isSaved ? 'Saved!' : 'Save All Changes'}</span>
          <span className="sm:hidden">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <DutyRatioConfigPanel 
          onRatioCalculated={handleRatioCalculated}
        />

        {matrix.map((table, tableIdx) => {
          // Keep specific styling for first tables
          let colors = {
            header: 'bg-slate-800 text-white',
          };
          if (table.id === 'security_duty') colors.header = 'bg-blue-900/90 text-white';
          if (table.id === 'nazirpara_tf') colors.header = 'bg-purple-900/90 text-white';
          if (table.id === 'base_tf') colors.header = 'bg-indigo-900/90 text-white';

          return (
            <div
              key={table.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden"
            >
              {/* Table Header Bar */}
              <div className={\`px-4 py-3 flex items-center justify-between \${colors.header}\`}>
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-black text-sm tracking-wider">
                    {tableIdx + 1}. {table.title}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                    Month Total: <strong className="font-mono">
                      {selectedFlightFilter === 'Overall' 
                        ? (table.totalRequiredMonth || 0) 
                        : (table.flightTargets?.[selectedFlightFilter as 'Mechanics' | 'Avionics' | 'GCS' | 'Admin'] || 0)}
                    </strong>
                  </span>
                  {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                    <>
                      <button
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
                      </button>
                    </>
                  )}
`;

code = code.replace(
  /<button\s*onClick=\{\(\) => toggleTableInfo\(tableIdx\)\}\s*title="Toggle Target\/Requirement Info"[\s\S]*?<Settings className="w-4 h-4" \/>\s*<\/button>/,
  replacement
);

// We need to also add missing imports for Upload, Lock, Settings, X if they are missing
code = code.replace("Info,", "Info,\n  Settings,\n  Upload,\n  Lock,\n  X,");

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
