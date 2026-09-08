const fs = require('fs');

let content = fs.readFileSync('src/firebase.ts', 'utf8');

// Replace export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
// with initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);
// But wait, the signature for initializeFirestore is initializeFirestore(app, settings, databaseId)

content = content.replace(
  'export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);',
  'export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);'
);

fs.writeFileSync('src/firebase.ts', content, 'utf8');
