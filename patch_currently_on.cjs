const fs = require('fs');

function patchFile(filePath, recordVarName, currentlyOnProp) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Find the generic div:
  // <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
  //   <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
  //     Currently On ...
  //   </div>
  //   <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
  //     {totalOnLeaveToday} <span className="text-xs font-semibold text-slate-400">Airmen</span>
  //   </div>
  //   <div className="text-[11px] text-slate-500 mt-0.5">Active ... status today</div>
  // </div>

  let componentName = filePath.includes('Leave') ? 'Leave' : filePath.includes('Tdy') ? 'TDY' : 'Attachment';
  
  // Get array calculation
  let arrCode = `const currentList = ${recordVarName}.filter((r: any) => r.${currentlyOnProp});`;
  
  let newHtml = `
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px]">
    <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 shrink-0 flex justify-between">
      <span>Currently On ${componentName}</span>
      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">{currentList.length}</span>
    </div>
    {currentList.length > 0 ? (
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
        {currentList.map((r: any) => (
          <div key={r.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md">
            <span>{r.airmanRank} {r.airmanName}</span>
            <span className="text-[10px] text-slate-400">{r.airmanFlight}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">
        Nobody on ${componentName} today
      </div>
    )}
  </div>`;
  
  // Replace the original block. We'll use a regex that matches `<div className="bg-white ..."> \n <div className="text-slate-500 ..."> \n Currently On ... \n ... </div>`
  
  // Since it's a bit hard to write a perfect regex for React JSX blocks, we can do string replacement of the specific block.
  let regex = /<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">\s*<div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">\s*Currently On [^\n]+\s*<\/div>\s*<div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">\s*\{[a-zA-Z0-9]+\}\s*<span className="text-xs font-semibold text-slate-400">Airmen<\/span>\s*<\/div>\s*<div className="text-\[11px\] text-slate-500 mt-0\.5">.*?<\/div>\s*<\/div>/g;

  content = content.replace(regex, `
        {(() => {
          ${arrCode}
          return (
            ${newHtml}
          );
        })()}
  `);

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Patched currently on in', filePath);
}

patchFile('src/components/LeaveRegisterView.tsx', 'leaveRecords', 'currentlyOnLeave');
patchFile('src/components/TdyRegisterView.tsx', 'tdyRecords', 'currentlyOnTdy');
patchFile('src/components/AttachmentRegisterView.tsx', 'attRecords', 'currentlyOnAtt');

