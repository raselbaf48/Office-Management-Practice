const fs = require('fs');
const files = ['src/components/PrintableParadeStateModal.tsx', 'src/components/ParadeStateFormattedView.tsx'];
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  
  // Fix From Date:
  text = text.replace(/From Date:\s*<\/div>/g, 'From Date:\n </label>');
  
  // What are the other errors? Let's check them if we can't compile.
  
  fs.writeFileSync(file, text);
}
