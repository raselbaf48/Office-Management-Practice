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

  // We want to replace `return (\n    <div className="fixed inset-0` with `return createPortal(\n    <div className="fixed inset-0`
  if (!content.includes('return createPortal(\n    <div className="fixed inset-0')) {
    content = content.replace(/return\s*\(\s*<div className="fixed inset-0/g, 'return createPortal(\n    <div className="fixed inset-0');
    
    // Make sure we have `, document.body)` at the very end of the file.
    // If it doesn't end with `, document.body);\n};\n` or similar, we fix it.
    if (!content.match(/,\s*document\.body\);\n?};\n?$/)) {
      // Find the last `  );\n};` or `  );\n}`
      content = content.replace(/  \);\n?};\n?$/g, '  , document.body);\n};\n');
    }
  }

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed real portals');
