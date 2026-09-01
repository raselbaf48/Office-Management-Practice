const fs = require('fs');

function patchFile(filePath, recordVarName, currentlyOnProp, airmanPropName = 'airmanId') {
  let content = fs.readFileSync(filePath, 'utf-8');
  let componentName = filePath.includes('Leave') ? 'Leave' : filePath.includes('Tdy') ? 'TDY' : 'Attachment';
  
  // Replace the inline currentList logic
  const searchRegex = /\{currentList\.map\(\(r: any\) => \([\s\S]*?<\/div>\s*\)\)\}/;
  
  const newMapping = `
        {currentList.map((r: any) => {
          const airman = airmen.find(a => a.id === r.${airmanPropName});
          return (
          <div key={r.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md">
            <span>{airman ? \`\${airman.rank} \${airman.name}\` : 'Unknown Airman'}</span>
            <span className="text-[10px] text-slate-400">{airman ? airman.flightName : ''}</span>
          </div>
          );
        })}
  `;
  
  content = content.replace(searchRegex, newMapping);
  fs.writeFileSync(filePath, content, 'utf-8');
}

patchFile('src/components/LeaveRegisterView.tsx', 'leaveRecords', 'currentlyOnLeave');
patchFile('src/components/TdyRegisterView.tsx', 'tdyRecords', 'currentlyOnTdy');
patchFile('src/components/AttachmentRegisterView.tsx', 'attRecords', 'currentlyOnAtt');

console.log('Fixed airmen display');
