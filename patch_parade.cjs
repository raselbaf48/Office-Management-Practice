const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const headerTarget = `<th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Eff Str</div>
                    </th>`;

const headerReplace = `<th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Det/Tdy</div>
                    </th>
                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Eff Str</div>
                    </th>`;

code = code.replace(headerTarget, headerReplace);

const dataRowTarget = `<td className="border border-slate-800 p-1 text-center align-middle">{stats.effStr}</td>`;

const dataRowReplace = `<td className="border border-slate-800 p-1 text-center align-middle">{stats.detTdyCount > 0 ? stats.detTdyCount : '-'}</td>
                        <td className="border border-slate-800 p-1 text-center align-middle">{stats.effStr}</td>`;

code = code.replace(dataRowTarget, dataRowReplace);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
console.log('Patched ParadeStateFormattedView.tsx');
