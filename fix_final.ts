import fs from 'fs';

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// The layout part starts around line 229:
// return (
//    <div className="w-full max-w-7xl mx-auto pb-12 animate-fadeIn space-y-6">

const startIndex = code.indexOf('<div className="w-full max-w-7xl mx-auto pb-12 animate-fadeIn space-y-6">');
// Find the end of Actions block, which ends with:
//              </button>
//            </>
//          )}
//        </div>
//      </div>

const actionsEndStr = `          )}
        </div>
      </div>`;
const actionsEndIndex = code.indexOf(actionsEndStr, startIndex);
const fullBrokenHeaderEndIndex = actionsEndIndex + actionsEndStr.length;

// We will replace everything from startIndex to fullBrokenHeaderEndIndex with the correctly structured header and tabs.

const newHeaderAndTabs = `<div className="w-full max-w-7xl mx-auto pb-12 animate-fadeIn space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-slate-800 text-slate-100 rounded-2xl shadow-md">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                155 UASU BAF • Duty Ratio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                Official Roster Scale
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configured daily quota ratio for Security Duty, Nazirpara T/F, Base T/F, and IDAC Shifts (Days 1–31).
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => exportDutyRatioDocx(matrix)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
            title="Download Duty Ratio as Document"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Document</span>
          </button>

          {(role === 'ADMIN' || role === 'SUPER_ADMIN') ? (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
                title="Import Duty Ratio from CSV or Excel file"
              >
                <Upload className="w-4 h-4" />
                <span>Import Ratio</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveMatrix(matrix)}
                className={\`px-3.5 py-2 text-xs font-bold text-white rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer \${
                  isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }\`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
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
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setViewMode('DUTY_DISTRIBUTION')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'DUTY_DISTRIBUTION'
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Layers className="w-4 h-4" />
          <span>Duty Distribution</span>
        </button>
        
        <button
          onClick={() => setViewMode('DUTY_RATIO')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'DUTY_RATIO'
              ? 'bg-blue-600 text-white shadow-blue-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Shield className="w-4 h-4" />
          <span>Duty Ratio</span>
        </button>

        <button
          onClick={() => setViewMode('MANPOWER')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'MANPOWER'
              ? 'bg-amber-500 text-white shadow-amber-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Manpower</span>
        </button>

        <button
          onClick={() => setViewMode('TOTAL_DUTY')}
          className={\`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-xs \${
            viewMode === 'TOTAL_DUTY'
              ? 'bg-purple-600 text-white shadow-purple-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }\`}
        >
          <Calendar className="w-4 h-4" />
          <span>Total Duty</span>
        </button>
      </div>
      
      {viewMode !== 'DUTY_RATIO' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
          <DutyRatioConfigPanel activeTab={viewMode} />
        </div>
      ) : (
        <div className="space-y-6">`;

const brokenBlock = code.substring(startIndex, fullBrokenHeaderEndIndex);
code = code.replace(brokenBlock, newHeaderAndTabs);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
