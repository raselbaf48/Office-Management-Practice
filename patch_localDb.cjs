const fs = require('fs');
let code = fs.readFileSync('src/services/localDatabase.ts', 'utf-8');

// 1. Update Constructor to add visibilitychange & beforeunload
const eventListenersStr = `      window.addEventListener("baf_theme_updated", () => this.saveToFirebase(this.db));
      
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          if (this.saveTimeout) { // Only sync if there are pending unsynced changes
            this.saveToFirebase(this.db, true);
          }
        }
      });
      window.addEventListener('beforeunload', () => {
        if (this.saveTimeout) {
          this.saveToFirebase(this.db, true);
        }
      });`;

code = code.replace(`      window.addEventListener("baf_theme_updated", () => this.saveToFirebase(this.db));`, eventListenersStr);

// 2. Replace saveToFirebase method
const oldSaveFuncRegex = /private async saveToFirebase\(dbToSave: LocalStorageDB\): Promise<void> \{[\s\S]*?\}, 15000\);\s*\}/;

const newSaveFunc = `private async saveToFirebase(dbToSave: LocalStorageDB, immediate = false): Promise<void> {
    if (typeof window === 'undefined') return;
    
    const doSave = async () => {
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
        // console.error('Firebase save error', e);
      }
    };

    if (immediate) {
      if (this.saveTimeout) clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
      await doSave();
      return;
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    // Auto-sync after 1 hour (3600000 ms)
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      doSave();
    }, 3600000);
  }`;

code = code.replace(oldSaveFuncRegex, newSaveFunc);

fs.writeFileSync('src/services/localDatabase.ts', code, 'utf-8');
console.log('Patched localDatabase.ts successfully');
