const fs = require('fs');

const files = [
  'src/components/PrintableDutyRatioModal.tsx',
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/PrintableNominalRollModal.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('overflow-x-hidden')) {
      content = content.replace(/overflow-x-hidden/g, 'overflow-x-auto');
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Patched overflow in ${file}`);
    }
  }
}
