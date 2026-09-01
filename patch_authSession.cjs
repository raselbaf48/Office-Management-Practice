const fs = require('fs');
let code = fs.readFileSync('src/utils/authSession.ts', 'utf8');

code = code.replace(
  '    if (localDb.db) {\n      localDb.db.detailedUsers = users;\n      localDb.forceSave();\n    }',
  '    // Sync handled automatically if we had a public setter, for now just use forceSave after injecting\n    (localDb as any).db.detailedUsers = users;\n    localDb.forceSave();'
);

fs.writeFileSync('src/utils/authSession.ts', code);
