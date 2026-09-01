const fs = require('fs');

['src/components/NightCountStateView.tsx', 'src/components/PrintableNightCountModal.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/'NIGHT COUNT STATE : AIRMEN'/g, "'NT COUNT STATE: AIRMEN'");
  fs.writeFileSync(file, content, 'utf-8');
});

console.log('Fixed titles');
