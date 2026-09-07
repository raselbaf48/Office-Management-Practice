const fs = require('fs');

let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// The button has: <span>Export Document</span>
const target = /<button[\s\S]*?onClick=\{handleDownloadDocx\}[\s\S]*?<Download className="w-4 h-4" \/>\s*<span>Export Document<\/span>\s*<\/button>/g;
content = content.replace(target, '');

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);

let content2 = fs.readFileSync('src/components/PrintableNightCountModal.tsx', 'utf8');
const target2 = /<button[\s\S]*?onClick=\{handleDownloadDocx\}[\s\S]*?<Download className="w-4 h-4" \/>\s*<span>Export Document<\/span>\s*<\/button>/g;
content2 = content2.replace(target2, '');

fs.writeFileSync('src/components/PrintableNightCountModal.tsx', content2);
