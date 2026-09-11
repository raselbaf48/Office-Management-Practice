const fs = require('fs');
const file = 'src/firebase.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, firebaseConfig.firestoreDatabaseId);",
  "export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);"
);
fs.writeFileSync(file, content);
console.log("Patched firebase.ts to use force long polling");
