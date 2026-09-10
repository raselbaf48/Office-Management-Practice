const fs = require('fs');
const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix the double wrap
  content = content.replace(
    /\{\!isPtDocument && \(\n\{\!isPtDocument && \((.*?)\)\}\n\)\}/g,
    '{!isPtDocument && ($1)}'
  );

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Patched syntax");
