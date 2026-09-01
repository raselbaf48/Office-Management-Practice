const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const getTarget = `  } catch (error) {
    console.error('Error loading from Firebase:', error);
    return null;`;
    
const getReplace = `  } catch (error: any) {
    if (error?.message?.includes('Quota') || error?.message?.includes('resource-exhausted') || error?.code === 'resource-exhausted') {
       quotaExceeded = true;
       if (typeof window !== 'undefined') {
         window.sessionStorage.setItem('firebase_quota_exceeded', 'true');
         window.dispatchEvent(new CustomEvent('baf_quota_exceeded'));
       }
       disableNetwork(db).catch(console.error);
       console.warn('Firebase quota exceeded during read. Cloud sync disabled.');
    } else {
       console.error('Error loading from Firebase:', error);
    }
    return null;`;
    
if (code.includes(getTarget)) {
  code = code.replace(getTarget, getReplace);
  fs.writeFileSync('src/firebase.ts', code);
  console.log('Patched getDbFromFirebase');
} else {
  console.log('Target not found in getDbFromFirebase');
}
