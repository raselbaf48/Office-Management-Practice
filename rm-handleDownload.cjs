const fs = require('fs');

function removeFunc(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/const handleDownloadDocx = async \(\) => \{[\s\S]*?\};\n/g, '');
  fs.writeFileSync(file, content);
}

removeFunc('src/components/PrintableParadeStateModal.tsx');
removeFunc('src/components/PrintableNightCountModal.tsx');
