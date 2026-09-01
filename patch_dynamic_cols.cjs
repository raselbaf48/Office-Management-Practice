const fs = require('fs');

function injectDynamicCols(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // We need to find the `Object.keys(customDisposalsMap)` array to map over in JSX.
  // Wait, in `ParadeStateFormattedView`, the `customDisposalsMap` is built outside the table.
  // We can just add `{Object.keys(customDisposalsMap).map(key => ... )}` before the Total Out header.
  
  // 1. Find the header for Total Out
  // `<th className="border border-slate-800 p-0.5 align-middle text-center font-extrabold">\n<div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)]">\n{isPtDocument ? 'Total Out PT' : 'Total Out Parade'}\n</div>\n</th>`
  
  // The header tag might differ slightly between the two files. Let's use a regex that matches `Total Out PT`.
  
  content = content.replace(
    /(<th[^>]*>[\s\S]*?(?:isPtDocument|documentType)[^>]*Total Out PT[^>]*>[\s\S]*?<\/th>)/,
    `{Object.keys(customDisposalsMap).map(key => (
      <th key={key} className="border border-black p-0.5 align-middle text-center">
        <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px] font-bold leading-tight">
          {key}
        </div>
      </th>
    ))}
    $1`
  );

  // 2. Find the data cell for Total Out
  // `<td className="border border-slate-800 p-1 font-black bg-slate-100 text-center align-middle">{stats.totalOutPt}</td>`
  content = content.replace(
    /(<td[^>]*>{stats\.totalOutPt}<\/td>)/,
    `{Object.keys(customDisposalsMap).map(key => {
      const count = customDisposalsMap[key].length;
      return <td key={key} className="border border-black p-0.5 text-center align-middle">{count > 0 ? count : '-'}</td>;
    })}
    $1`
  );
  
  // Also we need to increase the colspan of "Disposal / Out of Parade"
  // It is usually `<th className="border border-slate-800 p-1 text-center align-middle" colSpan={13}>Disposal / Out of Parade</th>`
  // We can change `colSpan={13}` to `colSpan={13 + Object.keys(customDisposalsMap).length}`. (Wait, let's just find `Disposal / Out of Parade` and replace its colSpan with a dynamic one)
  
  content = content.replace(
    /colSpan=\{([0-9]+)\}([^>]*>Disposal \/ Out of Parade)/g,
    `colSpan={$1 + Object.keys(customDisposalsMap).length}$2`
  );

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Patched dynamic columns in', filePath);
}

injectDynamicCols('src/components/ParadeStateFormattedView.tsx');
injectDynamicCols('src/components/PrintableParadeStateModal.tsx');
