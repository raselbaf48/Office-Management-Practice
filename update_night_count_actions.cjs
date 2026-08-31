const fs = require('fs');
let file = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

const oldActions = `{/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SINGLE DATE PICKER */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold space-x-2">
              <span className="text-slate-500 font-semibold">Dt:</span>
              <DateNavigator                  
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setToDate(e.target.value);
                  setSelectedDate(e.target.value);
                }}
                className="bg-transparent text-slate-900 dark:text-white font-black outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* History Button */}
          <button
            onClick={() => {
              if (activeTab === 'Flying Wing') {
                alert('Historical records are loaded automatically when you select previous dates from the dashboard date filter.');
              } else {
                alert('155 UASU BAF history is loaded by selecting previous dates or using the Multi-Day Export from the Overview tab.');
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="View History"
          >
            <span>History</span>
          </button>

          {/* Add Disposal Button (Admin Only) */}
          {true && (
            <button
              onClick={() => {
                if (activeTab === 'Flying Wing') {
                  setShowFlyingWingAdd(true);
                } else {
                  setDisposalScope('ALL');
                  setDisposalDateMode('SINGLE');
                  setShowAddDisposalModal(true);
                }
              }}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              title="Add or update personnel disposal"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Disposal</span>
            </button>
          )}

          {/* Official Export Button */}
          <button
            onClick={() => {
              if (activeTab === 'Flying Wing') {
                window.print(); // Just triggers print for Flying Wing since it doesn't have Docx generation yet
              } else {
                setIsInternalPrintOpen(true);
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer border border-slate-700"
            title="Download Official Document"
          >
            <Printer className="w-4 h-4" />
            <span>Official Export / Print</span>
          </button>`;

const newActions = `{/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* SINGLE DATE PICKER */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold space-x-2">
              <span className="text-slate-500 font-semibold">Dt:</span>
              <DateNavigator                  
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setToDate(e.target.value);
                  setSelectedDate(e.target.value);
                }}
                className="bg-transparent text-slate-900 dark:text-white font-black outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* History Button */}
          <button
            onClick={() => {
              if (activeTab === 'Flying Wing') {
                alert('You can navigate to previous records by selecting dates in the date picker (Dt:). Previous updates are saved there.');
              } else {
                alert('155 UASU BAF history is loaded by selecting previous dates or using the Multi-Day Export from the Overview tab.');
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="View History"
          >
            <span>History</span>
          </button>

          {/* Prepared By Button (Flying Wing Only) */}
          {activeTab === 'Flying Wing' && (
            <button
              onClick={() => setShowFlyingWingPrep(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Edit Prepared By"
            >
              <PenTool className="w-4 h-4" />
              <span>Prepared by</span>
            </button>
          )}

          {/* Add Disposal Button (Admin Only) */}
          {true && (
            <button
              onClick={() => {
                if (activeTab === 'Flying Wing') {
                  setShowFlyingWingAdd(true);
                } else {
                  setDisposalScope('ALL');
                  setDisposalDateMode('SINGLE');
                  setShowAddDisposalModal(true);
                }
              }}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              title="Add or update personnel disposal"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Disposal</span>
            </button>
          )}

          {/* Official Export Button */}
          <button
            onClick={() => {
              if (activeTab === 'Flying Wing') {
                setIsFlgWgPrintOpen(true);
              } else {
                setIsInternalPrintOpen(true);
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer border border-slate-700"
            title="Download Official Document"
          >
            <Printer className="w-4 h-4" />
            <span>Official Export / Print</span>
          </button>`;

file = file.replace(oldActions, newActions);
fs.writeFileSync('src/components/NightCountStateView.tsx', file, 'utf-8');
