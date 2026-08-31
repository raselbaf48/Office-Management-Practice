const fs = require('fs');
let code = fs.readFileSync('src/services/localDatabase.ts', 'utf8');

// Add debounce utility
const debounceInjection = `
let saveTimeout: any = null;
`;

code = code.replace(/private isFirebaseSyncing: boolean = false;/, "private isFirebaseSyncing: boolean = false;\n  private saveTimeout: any = null;");

// Modify saveToFirebase to use debounce
const saveToFirebaseFunc = `
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
        console.error('Firebase save error in background', e);
      }
    }, 2000);
  }
`;

code = code.replace(/private async saveToFirebase[\s\S]*?broadcastSyncState\(\);\s*\}\s*\} catch \(e\) \{\s*console\.error\('Firebase push failed', e\);\s*\}\s*\}/, saveToFirebaseFunc.trim());

fs.writeFileSync('src/services/localDatabase.ts', code);
