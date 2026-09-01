const fs = require('fs');
let code = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// I will just use regex to fix all the orphaned `}` and `)` and then use prettier to format it and see if it passes.
