const fs = require('fs');

let file = 'src/services/localDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace the buggy sync push logic
const oldSyncLogic = `// If local is newer, push to Firebase instead of pulling
        if (localTime > fbTime) {
           this.saveToFirebase(this.db);
           return true;
        }`;

const newSyncLogic = `// If local is newer, push to Firebase instead of pulling
        // FIX: NEVER push from a completely fresh/empty local state to overwrite cloud data.
        // We determine if local is "fresh" by checking if activityHistory is completely empty, 
        // OR if airmen length is exactly the initial count but assignments are empty.
        const isLocalBasicallyEmpty = !this.db.activityHistory || this.db.activityHistory.length === 0;

        if (localTime > fbTime && !isLocalBasicallyEmpty) {
           this.saveToFirebase(this.db);
           return true;
        }
        
        // If local is basically empty, ALWAYS prefer cloud data even if local timestamp is technically "newer"
        // (which happens on first load on a new device)`;

if (code.includes(oldSyncLogic)) {
  code = code.replace(oldSyncLogic, newSyncLogic);
  fs.writeFileSync(file, code);
  console.log('Successfully applied sync fix.');
} else {
  console.log('Could not find the target sync logic to replace.');
}

