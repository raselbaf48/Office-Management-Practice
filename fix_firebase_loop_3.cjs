const fs = require('fs');
let code = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

// Fix Duplicate member "saveTimeout" error
code = code.replace(/private saveTimeout: any = null;\s*private async saveToFirebase/, "private async saveToFirebase");

fs.writeFileSync('src/services/localDatabase.ts', code);
