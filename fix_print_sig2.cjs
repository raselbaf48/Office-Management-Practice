const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf-8');

content = content.replace(
  /<div className="text-center font-bold min-w-\[200px\]">/g,
  '<div className="text-left font-bold min-w-[200px]">'
);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);
