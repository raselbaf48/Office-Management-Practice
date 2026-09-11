const fs = require('fs');
const file = 'src/firebase.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);",
  "export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, firebaseConfig.firestoreDatabaseId);"
);
fs.writeFileSync(file, content);
console.log("Patched firebase.ts with auto detect");
