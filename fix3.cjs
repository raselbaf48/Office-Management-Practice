const fs = require('fs');
let lines = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8').split('\n');

let start = -1;
for (let i = 1000; i < lines.length; i++) {
  if (lines[i].includes('const handleDownloadDocx = async () => {')) {
    start = i;
    break;
  }
}

if (start !== -1) {
  let end = -1;
  // look for `// Compute Flight Stats`
  for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('// Compute Flight Stats for Single-Day')) {
      end = i;
      break;
    }
  }
  
  if (end !== -1) {
    lines.splice(start, end - start);
    fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', lines.join('\n'));
    console.log("Deleted from", start, "to", end);
  }
}
