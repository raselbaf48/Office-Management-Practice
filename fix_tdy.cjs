const fs = require('fs');
let code = fs.readFileSync('src/components/TdyRegisterView.tsx', 'utf8');

const tdyInputHTML = `              {/* TDY Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Destination (Mandatory) <span className="text-red-500">*</span>
                </label>
                <select
                  value={tdyDestination}
                  onChange={(e) => setTdyDestination(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="">Select Destination</option>
                  <option value="AIR HQ">AIR HQ</option>
                  <option value="BAF AKR">BAF AKR</option>
                  <option value="BAF BSR">BAF BSR</option>
                  <option value="BAF MTR">BAF MTR</option>
                  <option value="BAF CXB">BAF CXB</option>
                  <option value="BAF SMD">BAF SMD</option>
                  <option value="Custom">Other Custom...</option>
                </select>
                {tdyDestination === 'Custom' && (
                  <input
                    type="text"
                    value={tdyCustomDestination}
                    onChange={(e) => setTdyCustomDestination(e.target.value)}
                    placeholder="Enter custom destination..."
                    className="w-full mt-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                )}
              </div>
              
              {/* Remarks (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={tdyRemarks}
                  onChange={(e) => setTdyRemarks(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>`;

code = code.replace(
  /\{\/\* TDY Destination \/ Notes \*\/\}(.|\n)*?outline-none"\s*\/>\s*<\/div>/,
  tdyInputHTML
);

fs.writeFileSync('src/components/TdyRegisterView.tsx', code);
