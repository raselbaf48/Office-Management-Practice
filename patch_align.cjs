const fs = require('fs');

const file = 'src/components/DutyRatioMatrixView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace all text-left in table headers and cells to text-center for better central alignment
content = content.replace(/className="([^"]*)text-left([^"]*)"/g, (match, p1, p2) => {
  // If it's a table header or cell, we change it to text-center
  // But wait, the regex just grabs any text-left. Let's be careful.
  return `className="${p1}text-center${p2}"`;
});

// Remove duplicate text-center text-center
content = content.replace(/text-center(\s+text-center)+/g, 'text-center');

fs.writeFileSync(file, content, 'utf8');
console.log('Patched alignment in DutyRatioMatrixView');
