const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

// replace header Det/ Tdy
const headerToRemove = `                    <th className="border border-slate-800 p-0.5 align-middle text-center">
                      <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">Det/ Tdy</div>
                    </th>`;
code = code.replace(headerToRemove, '');

// replace body
const bodyToRemove = `<td className="border border-slate-800 p-1 text-center align-middle">{stats.detTdyCount > 0 ? stats.detTdyCount : '-'}</td>`;
code = code.replace(bodyToRemove, '');

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
