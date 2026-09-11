const fs = require('fs');
const file = 'src/components/PrintableParadeStateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

if (content.includes('createPortal(')) {
  const replacement = ',\n    document.body\n  );\n};';
  content = content.replace(/\s*\);\s*};\s*$/, replacement);
  fs.writeFileSync(file, content);
  console.log("Patched createPortal in PrintableParadeStateModal.tsx");
} else {
  console.log("createPortal not found");
}
