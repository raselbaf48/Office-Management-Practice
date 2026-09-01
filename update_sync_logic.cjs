const fs = require('fs');
let content = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

content = content.replace(
  'firebaseLastSyncTime = new Date().toLocaleTimeString();\n          broadcastSyncState();',
  'firebaseLastSyncTime = new Date().toLocaleTimeString();\n          addSyncLog({ timestamp: new Date().toISOString(), type: "PUSH", status: "SUCCESS", message: "Successfully saved local data to cloud" });\n          broadcastSyncState();'
);

content = content.replace(
  '// console.error(\'Firebase save error\', e);',
  'addSyncLog({ timestamp: new Date().toISOString(), type: "PUSH", status: "ERROR", message: "Failed to push to cloud" });\n        // console.error(\'Firebase save error\', e);'
);

fs.writeFileSync('src/services/localDatabase.ts', content);
