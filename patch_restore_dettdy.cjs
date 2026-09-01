const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const headerTarget = `<th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Eff Str</div>
                      </th>`;

const headerReplace = `<th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Det/Tdy</div>
                      </th>
                      <th className="border border-black p-0 align-bottom text-center align-middle">
                        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">Eff Str</div>
                      </th>`;

code = code.replace(headerTarget, headerReplace);

const dataRowTarget = `<td className="border border-black p-0.5 text-center align-middle">{stats.effStr}</td>`;

const dataRowReplace = `<td className="border border-black p-0.5 text-center align-middle">{stats.detTdyCount > 0 ? stats.detTdyCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.effStr}</td>`;

code = code.replace(dataRowTarget, dataRowReplace);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
console.log('Restored Det/Tdy in PrintableParadeStateModal.tsx');
