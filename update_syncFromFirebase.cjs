const fs = require('fs');
let content = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

content = content.replace(
  'firebaseLastSyncTime = new Date().toLocaleTimeString();\n        broadcastSyncState();',
  'firebaseLastSyncTime = new Date().toLocaleTimeString();\n        addSyncLog({ timestamp: new Date().toISOString(), type: "PULL", status: "SUCCESS", message: hasUpdates ? "Pulled new updates from cloud" : "Cloud data is up to date" });\n        broadcastSyncState();'
);

content = content.replace(
  'console.error(\'Firebase sync failed\', e);',
  'addSyncLog({ timestamp: new Date().toISOString(), type: "PULL", status: "ERROR", message: "Failed to pull from cloud" });\n      console.error(\'Firebase sync failed\', e);'
);

fs.writeFileSync('src/services/localDatabase.ts', content);
