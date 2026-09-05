const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

// The error was "src/components/UserManagementTab.tsx(382,21): error TS2657: JSX expressions must have one parent element."
// I will just use sed or Node to check around line 382.
