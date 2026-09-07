const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const startIdx = content.indexOf('const handleDownloadDocx = async () => {\n  if (isMultiDay) {');
if (startIdx !== -1) {
  const endIdx = content.indexOf('  if (!isOpen) return null;', startIdx);
  if (endIdx !== -1) {
    content = content.slice(0, startIdx) + content.slice(endIdx);
    fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);
  }
}
