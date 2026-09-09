const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf8');

content = content.replace(
  /\/\/ Disable writing to cloud when running in AI Studio preview or development[\s\S]*?return 'SIMULATED'; \/\/ Return a special string to indicate simulated save\n  \}/,
  '// Cloud writing is enabled'
);

fs.writeFileSync('src/firebase.ts', content, 'utf8');
