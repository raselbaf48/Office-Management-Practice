const fs = require('fs');
let code = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

// Replace the entire saveToFirebase function block precisely using indices
const startStr = "private async saveToFirebase(dbToSave: LocalStorageDB): Promise<void> {";
const endStr = "private loadInitialLocalState(): LocalStorageDB {";

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex > -1 && endIndex > -1) {
  const newSaveToFirebase = `private saveTimeout: any = null;
  private async saveToFirebase(dbToSave: LocalStorageDB): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Debounce to prevent multiple rapid writes and quota exhaustion
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      try {
        const success = await saveDbToFirebase({
          airmen: dbToSave.airmen,
          assignments: dbToSave.assignments,
          adminPasscode: dbToSave.adminPasscode,
          activityHistory: dbToSave.activityHistory,
          lastUpdated: dbToSave.lastUpdated,
        });
        if (success) {
          firebaseConnected = true;
          firebaseLastSyncTime = new Date().toLocaleTimeString();
          broadcastSyncState();
        }
      } catch (e) {
        // console.error('Firebase save error in background', e);
      }
    }, 2000);
  }

  `;
  
  code = code.substring(0, startIndex) + newSaveToFirebase + code.substring(endIndex);
  fs.writeFileSync('src/services/localDatabase.ts', code);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find start or end index.");
}

