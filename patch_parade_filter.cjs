const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  if (code.includes('ALL_DISPOSAL_OPTIONS.map((opt) => (')) {
    code = code.replace(
      'ALL_DISPOSAL_OPTIONS.map((opt) => (',
      "ALL_DISPOSAL_OPTIONS.filter(opt => opt.code === 'OTHERS' || !savedDisposals.some(d => d.code === opt.code)).map((opt) => ("
    );
    console.log('Patched', file);
    fs.writeFileSync(file, code);
  }
});
