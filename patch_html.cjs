const fs = require('fs');
let code = fs.readFileSync('src/utils/htmlExport.ts', 'utf8');

code = code.replace(
  "(el.style.display",
  "((el as HTMLElement).style.display"
);

fs.writeFileSync('src/utils/htmlExport.ts', code);
