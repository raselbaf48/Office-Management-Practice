const fs = require('fs');

const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/DutyRosterPeriodView.tsx', 'src/components/NightCountStateView.tsx', 'src/components/PrintableParadeStateModal.tsx', 'src/components/PrintableNightCountModal.tsx'];

for (const file of files) {
  if(!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf-8');

  content = content.replace(/addDisposalLoading/g, 'disposalLoading');
  
  fs.writeFileSync(file, content);
}
console.log("Fixed disposalLoading");
