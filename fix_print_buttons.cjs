const fs = require('fs');

let ntContent = fs.readFileSync('src/components/PrintableNightCountModal.tsx', 'utf8');
ntContent = ntContent.replace(
  /onClick=\{\(\) => window\.print\(\)\}/g,
  "onClick={() => { document.title = getPdfTitle(); window.print(); }}"
);
fs.writeFileSync('src/components/PrintableNightCountModal.tsx', ntContent);

let flgContent = fs.readFileSync('src/components/PrintableFlyingWingModal.tsx', 'utf8');
flgContent = flgContent.replace(
  /onClick=\{\(\) => window\.print\(\)\}/g,
  "onClick={() => { document.title = `Consolidated Night Count State - Flg Wg (${formatted})`; window.print(); }}"
);
fs.writeFileSync('src/components/PrintableFlyingWingModal.tsx', flgContent);

console.log("Fixed window.print() in NightCount and FlyingWing modals");
