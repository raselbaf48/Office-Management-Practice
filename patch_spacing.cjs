const fs = require('fs');

// 1. Patch SignatureConfigModal.tsx
let file = 'src/components/SignatureConfigModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /<div className="border-t border-slate-400 dark:border-slate-600 pt-1">/g,
    '<div className="border-t border-slate-400 dark:border-slate-600 pt-1 leading-[1.1] space-y-0">'
  );

  fs.writeFileSync(file, content);
}

// 2. Patch PrintableParadeStateModal.tsx
file = 'src/components/PrintableParadeStateModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // There are two kinds: <div className="space-y-0.5"> and <div className="space-y-0.5 text-left text-[11px]">
  // We want to remove space-y-0.5 and add leading-[1.1]
  
  content = content.replace(
    /<div className="space-y-0.5">/g,
    '<div className="leading-[1.1]">'
  );
  
  content = content.replace(
    /<div className="space-y-0.5 inline-block text-left">/g,
    '<div className="leading-[1.1] inline-block text-left">'
  );

  content = content.replace(
    /<div className="space-y-0.5 text-left text-\[11px\]">/g,
    '<div className="leading-[1.1] text-left text-[11px]">'
  );

  fs.writeFileSync(file, content);
}

// 3. Patch docxExport.ts
file = 'src/utils/docxExport.ts';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace spacing for the signature blocks
  // Since all we did was put `spacing: { after: 20 }` and `spacing: { after: 30 }` in the signature replacements earlier...
  content = content.replace(/spacing: \{ after: 20 \}/g, "spacing: { after: 0, line: 240 }");
  content = content.replace(/spacing: \{ after: 30 \}/g, "spacing: { after: 0, line: 240 }");

  fs.writeFileSync(file, content);
}
