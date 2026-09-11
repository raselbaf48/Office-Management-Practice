const fs = require('fs');
const file = 'src/firebase.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "arg.includes('maximum backoff delay')))) return;",
  "arg.includes('maximum backoff delay') || arg.includes('Could not reach Cloud Firestore backend') || arg.includes('offline mode')))) return;"
);

content = content.replace(
  "console.error('Error loading from Firebase:', error);",
  "if (error?.message?.includes('offline')) { console.warn('Firebase is offline. Using local data.'); } else { console.error('Error loading from Firebase:', error); }"
);

fs.writeFileSync(file, content);
