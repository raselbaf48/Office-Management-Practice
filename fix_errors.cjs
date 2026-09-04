const fs = require('fs');

let flgContent = fs.readFileSync('src/components/PrintableFlyingWingModal.tsx', 'utf8');
// formatted is defined inside the component, but where is onClick?
// Let's check where it is.
