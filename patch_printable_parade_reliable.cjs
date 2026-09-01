const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// For Data Row
let lines = code.split('\n');
let startIdx = lines.findIndex(l => l.includes('{stats.essnCount > 0 ? stats.essnCount : \'-\'}</td>'));
let endIdx = lines.findIndex(l => l.includes('{stats.absentCount > 0 ? stats.absentCount : \'-\'}</td>'));

if (startIdx !== -1 && endIdx !== -1) {
    let newBlock = `                          <td className="border border-black p-0.5 text-center align-middle">{stats.essnCount > 0 ? stats.essnCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.hospitalCount > 0 ? stats.hospitalCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.sickExCount > 0 ? stats.sickExCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.drillCatCCount > 0 ? stats.drillCatCCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.guardDutyCount > 0 ? stats.guardDutyCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.bakeBiteCount > 0 ? stats.bakeBiteCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.koReceptionCount > 0 ? stats.koReceptionCount : '-'}</td>
                          <td className="border border-black p-0.5 text-center align-middle">{stats.gamesCount > 0 ? stats.gamesCount : '-'}</td>
                          {Object.keys(customDisposalsMap).map(key => {
                            const count = customDisposalsMap[key].length;
                            return <td key={key} className="border border-black p-0.5 text-center align-middle">{count > 0 ? count : '-'}</td>;
                          })}
                          <td className="border border-black p-0.5 font-bold text-center align-middle">{stats.totalOutPt}</td>
                          <td className="border border-black p-0.5 font-bold text-center align-middle">{stats.onPtParadeCount}</td>`;
    
    lines.splice(startIdx, endIdx - startIdx + 1, newBlock);
}

code = lines.join('\n');
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', code);
console.log('Patched PrintableParadeStateModal.tsx Data Row');
