const fs = require('fs');
let printContent = fs.readFileSync('src/components/PrintableNightCountModal.tsx', 'utf-8');

const printTdTarget = `<td className="border-r border-black p-1 text-center align-middle">{stats.gamesCount || '-'}</td>`;
const printTdReplacement = `<td className="border-r border-black p-1 text-center align-middle">{stats.gamesCount || '-'}</td>
                      {Object.keys(customDisposalsMap).map(key => {
                        const count = customDisposalsMap[key].length;
                        return <td key={key} className="border-r border-black p-1 text-center align-middle">{count > 0 ? count : '-'}</td>;
                      })}`;
printContent = printContent.replace(new RegExp(printTdTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), printTdReplacement);

fs.writeFileSync('src/components/PrintableNightCountModal.tsx', printContent, 'utf-8');
console.log('Patched print td.');
