const fs = require('fs');

function injectDynamicCols(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Header replacement
  let parts = content.split(/<th[^>]*>\s*<div[^>]*>\s*\{?(?:isPtDocument|documentType)[^}]*(?:'Total Out PT'|"Total Out PT")[^}]*\}?\s*<\/div>\s*<\/th>/);
  if (parts.length === 2) {
    let newHeader = `
                    {Object.keys(customDisposalsMap).map(key => (
                      <th key={key} className="border border-slate-800 border-black p-0.5 align-middle text-center">
                        <div className="w-full h-28 h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
                          {key}
                        </div>
                      </th>
                    ))}
                    `;
    content = parts[0] + newHeader + `<th className="border border-black p-0.5 align-middle text-center font-extrabold"><div className="w-full h-20 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">{${filePath.includes('Printable') ? 'documentType' : 'isPtDocument'} === 'PT' ? 'Total Out PT' : 'Total Out Parade'}</div></th>` + parts[1];
  } else {
    console.log("Could not find header in", filePath);
  }

  // Data cell replacement
  let tdParts = content.split(/<td[^>]*>\{stats\.totalOutPt\}<\/td>/);
  if (tdParts.length === 2) {
    let newTd = `
                    {Object.keys(customDisposalsMap).map(key => {
                      const count = customDisposalsMap[key].length;
                      return <td key={key} className="border border-black p-0.5 text-center align-middle">{count > 0 ? count : '-'}</td>;
                    })}
                    <td className="border border-black p-0.5 font-bold text-center align-middle">{stats.totalOutPt}</td>
    `;
    content = tdParts[0] + newTd + tdParts[1];
  } else {
    console.log("Could not find td in", filePath);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Patched dynamic columns in', filePath);
}

injectDynamicCols('src/components/ParadeStateFormattedView.tsx');
injectDynamicCols('src/components/PrintableParadeStateModal.tsx');
