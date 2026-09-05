const fs = require('fs');

let file = 'src/services/localDatabase.ts';
let code = fs.readFileSync(file, 'utf8');

// Also prevent saveToFirebase from pushing if we are currently syncing
const oldSaveToFirebase = `private async saveToFirebase(dbToSave: LocalStorageDB, immediate = false): Promise<void> {
    if (typeof window === 'undefined') return;`;

const newSaveToFirebase = `private async saveToFirebase(dbToSave: LocalStorageDB, immediate = false): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Prevent accidental pushes if we haven't finished our initial sync pull yet
    if (this.isFirebaseSyncing) {
       console.warn('Prevented saveToFirebase because a pull sync is currently in progress.');
       return;
    }`;

if (code.includes(oldSaveToFirebase)) {
  code = code.replace(oldSaveToFirebase, newSaveToFirebase);
  fs.writeFileSync(file, code);
  console.log('Successfully added saveToFirebase guard.');
} else {
  console.log('Could not find the target saveToFirebase to replace.');
}

