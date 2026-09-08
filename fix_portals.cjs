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

  // Fix all `return createPortal(\n    <div` to `return (\n    <div`
  content = content.replace(/return createPortal\(\n?\s*<div/g, 'return (\n    <div');
  
  // Fix `), document.body);`
  content = content.replace(/  \),\s*document\.body\);\n};\n?$/g, '  );\n};\n');
  content = content.replace(/  \),\s*document\.body\);\n}$/g, '  );\n}');

  // Now, correctly replace only the FIRST `return (` inside the component
  // We can find the component's main return by looking for `return (` after the props declaration.
  // A simple way is to match `export const Printable...` and then the first `return (\n` after it.
  
  const compName = file.split('/').pop().replace('.tsx', '');
  const exportStr = `export const ${compName}`;
  const exportIdx = content.indexOf(exportStr);
  
  if (exportIdx !== -1) {
    const returnIdx = content.indexOf('return (', exportIdx);
    if (returnIdx !== -1) {
      content = content.slice(0, returnIdx) + 'return createPortal(' + content.slice(returnIdx + 8);
      
      // And we need to add `, document.body)` at the end of the file.
      // Assuming the file ends with `  );\n};\n`
      content = content.replace(/  \);\n};\n?$/g, '  ), document.body);\n};\n');
      content = content.replace(/  \);\n}$/g, '  ), document.body);\n}');
    }
  }

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed portals');
