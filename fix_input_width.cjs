const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

const tableHeaderTarget = `                        <tr>
                          <th className="px-3 py-2">Ser No</th>
                          <th className="px-3 py-2">Rank</th>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Trade</th>
                          <th className="px-3 py-2">Flt</th>
                          <th className="px-3 py-2">Disposal</th>
                        </tr>`;

const tableHeaderReplacement = `                        <tr>
                          <th className="px-3 py-2 w-16">Ser No</th>
                          <th className="px-3 py-2 w-16">Rank</th>
                          <th className="px-3 py-2 w-48">Name</th>
                          <th className="px-3 py-2 w-32">Trade</th>
                          <th className="px-3 py-2 w-24">Flt</th>
                          <th className="px-3 py-2 w-40">Disposal</th>
                        </tr>`;
code = code.replace(tableHeaderTarget, tableHeaderReplacement);


const inputTarget = `                                <input
                                  type="text"
                                  list="disposal-options"
                                  value={currentVal}
                                  onChange={(e) => setDisposals({ ...disposals, [a.id]: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                                  placeholder="Select or type..."
                                />`;

const inputReplacement = `                                <input
                                  type="text"
                                  list="disposal-options"
                                  value={currentVal}
                                  onChange={(e) => setDisposals({ ...disposals, [a.id]: e.target.value })}
                                  className="w-full px-1 py-1 text-xs bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 text-slate-800 dark:text-slate-200 outline-none focus:ring-0 transition-colors"
                                  placeholder="Select..."
                                />`;
code = code.replace(inputTarget, inputReplacement);

// Just remove whitespace nowrap from the table to allow things to grow if needed
// Actually, setting min-widths on table would be better. Let's do that via className.
const tableTarget = `<table className="w-full text-left text-xs whitespace-nowrap">`;
const tableReplacement = `<table className="w-full min-w-[700px] text-left text-xs">`;
code = code.replace(tableTarget, tableReplacement);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
