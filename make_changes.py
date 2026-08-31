import re

with open('src/components/NightCountStateView.tsx', 'r') as f:
    code = f.read()

# 1. Update the top action controls to only show Dt (single), Add Disposal, Official Export, Refresh
# Find the start of Action Controls
start_controls = code.find('{/* Action Controls */}')
end_controls = code.find('</div>\n      </div>', start_controls)

new_controls = """{/* Action Controls */}
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

          {/* Add Disposal Button (Admin Only) */}
          {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <button
              onClick={() => {
                setDisposalScope('ALL');
                setDisposalDateMode('SINGLE');
                setShowAddDisposalModal(true);
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
            onClick={handleDownloadDocx}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
            title="Download Official Document"
          >
            <Printer className="w-4 h-4" />
            <span>Official Export / Print</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchSingle()}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 font-bold text-xs"
            title="Refresh Data"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
"""
code = code[:start_controls] + new_controls + code[end_controls:]

# 2. Table background black to white/light gray
# Search for bg-slate-200 dark:bg-slate-800 in the thead and remove the dark background for a lighter one, or just bg-slate-100 dark:bg-slate-800
code = code.replace('<tr className="border-b border-slate-900 dark:border-slate-300 bg-slate-200 dark:bg-slate-800">', '<tr className="border-b border-slate-900 dark:border-slate-300 bg-white">')


# 3. Ensure L/In Cpl & Below filter for bottom lists. 
# `targetAirmen` is currently `selectedFlight === 'Overall' ? airmen : airmen.filter(...)`.
# But `airmen` passed as prop was already filtered? No, `airmen={airmen.filter...}` was in `App.tsx`?
# Wait! In NightCountStateView, `airmen` is a prop. I replaced `airmen={airmen}` but where? Oh, I replaced it in PT State, which I didn't actually do since `airmen={airmen}` was in `Dashboard`?
# Ah, I replaced it inside NightCountStateView for the `airmen` it receives? NO.
# Let's enforce L/in Cpl & Below inside NightCountStateView directly to be completely sure.
filter_target = """
  // Single-Day Categorization for Bottom Lists
  const targetAirmen = (selectedFlight === 'Overall' ? airmen : airmen.filter((a) => a.flightName === selectedFlight)).filter(a => {
    if (!['CPL', 'Cpl', 'LAC', 'AC'].includes(a.rank)) return false;
    const block = (a.addressBlock || '').toLowerCase();
    return !(block.includes('qtr') || block.includes('quarter') || block.includes('outside'));
  });
"""
code = re.sub(r'// Single-Day Categorization for Bottom Lists\s+const targetAirmen = [^;]+;', filter_target, code, count=1)


with open('src/components/NightCountStateView.tsx', 'w') as f:
    f.write(code)

print("Done")
