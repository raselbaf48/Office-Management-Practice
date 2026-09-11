const fs = require('fs');

const files = [
  'src/components/PrintableFlyingWingModal.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('createPortal(')) {
    const replacement = ',\n    document.body\n  );\n};';
    content = content.replace(/\s*\);\s*};\s*$/, replacement);
    fs.writeFileSync(file, content);
    console.log(`Patched createPortal in ${file}`);
  }
}
