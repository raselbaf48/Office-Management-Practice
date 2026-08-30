const fs = require('fs');

let file = 'src/components/SignatureConfigModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/leading-\[1\.1\] space-y-0/g, 'leading-tight space-y-[2px]');
  fs.writeFileSync(file, content);
}

file = 'src/components/PrintableParadeStateModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/leading-\[1\.1\] inline-block/g, 'leading-tight space-y-[2px] inline-block');
  content = content.replace(/leading-\[1\.1\] text-left/g, 'leading-tight space-y-[2px] text-left');
  content = content.replace(/className="leading-\[1\.1\]"/g, 'className="leading-tight space-y-[2px]"');
  fs.writeFileSync(file, content);
}

file = 'src/utils/docxExport.ts';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/spacing: \{ after: 0, line: 240 \}/g, 'spacing: { after: 15, line: 240 }');
  fs.writeFileSync(file, content);
}
