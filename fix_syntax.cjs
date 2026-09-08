const fs = require('fs');
const files = [
  'src/components/PrintableDutyRatioModal.tsx',
  'src/components/PrintableFlyingWingModal.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/PrintableNominalRollModal.tsx',
  'src/components/PrintableParadeStateModal.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix the extra closing parenthesis before the comma
  content = content.replace(/\),\s*document\.body\);/g, ', document.body);');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed syntax error');
