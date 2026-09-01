const fs = require('fs');

function patchTdy() {
  let content = fs.readFileSync('src/components/TdyRegisterView.tsx', 'utf-8');
  
  const destSelect = `<select
                  value={tdyDestination}
                  onChange={(e) =>
                  setTdyDestination(e.target.value)}
                  className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \${!tdyDestination ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'}\`}
                >
                  <option value="" disabled>— Select Destination —</option>
                  <option value="">Select Destination</option>
                  <option value="AIR HQ">AIR HQ</option>
                  <option value="BAF AKR">BAF AKR</option>
                  <option value="BAF BSR">BAF BSR</option>
                  <option value="BAF MTR">BAF MTR</option>
                  <option value="BAF CXB">BAF CXB</option>
                  <option value="BAF SMD">BAF SMD</option>
                  <option value="Custom">Other Custom...</option>
                </select>`;

  const destButtons = `<div className="flex flex-wrap gap-1.5">
                  {['AIR HQ', 'BAF AKR', 'BAF BSR', 'BAF MTR', 'BAF CXB', 'BAF SMD', 'Custom'].map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setTdyDestination(dest)}
                      className={\`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer \${
                        tdyDestination === dest
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }\`}
                    >
                      {dest === 'Custom' ? 'Other Custom...' : dest}
                    </button>
                  ))}
                </div>`;

  content = content.replace(destSelect, destButtons);
  fs.writeFileSync('src/components/TdyRegisterView.tsx', content, 'utf-8');
}

function patchAtt() {
  let content = fs.readFileSync('src/components/AttachmentRegisterView.tsx', 'utf-8');
  
  const destSelect = `<select
                  value={attDestination}
                  onChange={(e) => setAttDestination(e.target.value)}
                  className={\`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer \${!attDestination ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-700'}\`}
                >
                  <option value="" disabled>— Select Destination —</option>
                  <option value="">Select Destination</option>
                  <option value="AIR HQ">AIR HQ</option>
                  <option value="BAF AKR">BAF AKR</option>
                  <option value="BAF BSR">BAF BSR</option>
                  <option value="BAF MTR">BAF MTR</option>
                  <option value="BAF CXB">BAF CXB</option>
                  <option value="BAF SMD">BAF SMD</option>
                  <option value="Custom">Other Custom...</option>
                </select>`;

  const destButtons = `<div className="flex flex-wrap gap-1.5">
                  {['AIR HQ', 'BAF AKR', 'BAF BSR', 'BAF MTR', 'BAF CXB', 'BAF SMD', 'Custom'].map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setAttDestination(dest)}
                      className={\`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer \${
                        attDestination === dest
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }\`}
                    >
                      {dest === 'Custom' ? 'Other Custom...' : dest}
                    </button>
                  ))}
                </div>`;

  content = content.replace(destSelect, destButtons);
  fs.writeFileSync('src/components/AttachmentRegisterView.tsx', content, 'utf-8');
}

patchTdy();
patchAtt();
console.log("Patched Destinations");
