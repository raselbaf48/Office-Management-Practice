const fs = require('fs');
const files = ['src/components/NightCountStateView.tsx', 'src/components/PrintableNightCountModal.tsx', 'src/components/ParadeStateFormattedView.tsx', 'src/components/PrintableParadeStateModal.tsx'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/Drill Cat 'C'/g, "Drill Cat-C");
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Fixed quotes in', file);
  }
});
