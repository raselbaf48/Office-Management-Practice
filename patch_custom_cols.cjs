const fs = require('fs');

let content = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

// For <th> headers
const thTarget = `<th className="border-r border-black p-2 align-middle font-bold text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Games /Guard of Honor</th>`;
const thReplacement = `<th className="border-r border-black p-2 align-middle font-bold text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Games /Guard of Honor</th>
                  {Object.keys(customDisposalsMap).map(key => (
                    <th key={key} className="border-r border-black p-2 align-middle font-bold text-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{key}</th>
                  ))}`;
content = content.replace(new RegExp(thTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), thReplacement);

// For <td> cells in NightCountStateView (it has `{stats.gamesCount || '-'}`)
const tdTarget = `<td className="border-r border-black p-1 align-middle text-center">{stats.gamesCount || '-'}</td>`;
const tdReplacement = `<td className="border-r border-black p-1 align-middle text-center">{stats.gamesCount || '-'}</td>
                      {Object.keys(customDisposalsMap).map(key => {
                        const count = customDisposalsMap[key].length;
                        return <td key={key} className="border-r border-black p-1 align-middle text-center">{count > 0 ? count : '-'}</td>;
                      })}`;
content = content.replace(new RegExp(tdTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), tdReplacement);

fs.writeFileSync('src/components/NightCountStateView.tsx', content, 'utf-8');

// Now for PrintableNightCountModal.tsx
let printContent = fs.readFileSync('src/components/PrintableNightCountModal.tsx', 'utf-8');

// Print <th>
const printThTarget = `<th className="border-r border-black p-2 align-middle font-bold text-center p-0.5"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Games /Guard of Honor</div></th>`;
const printThReplacement = `<th className="border-r border-black p-2 align-middle font-bold text-center p-0.5"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Games /Guard of Honor</div></th>
                  {Object.keys(customDisposalsMap).map(key => (
                    <th key={key} className="border-r border-black p-2 align-middle font-bold text-center p-0.5"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">{key}</div></th>
                  ))}`;
printContent = printContent.replace(new RegExp(printThTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), printThReplacement);

// Print <td> (Wait, let's see how PrintableNightCountModal renders td)
fs.writeFileSync('src/components/PrintableNightCountModal.tsx', printContent, 'utf-8');

console.log('Patched th headers.');
