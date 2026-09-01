const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

if (!code.includes('disableNetwork')) {
  code = code.replace(
    'import { getFirestore, doc, setDoc, getDoc } from \'firebase/firestore\';',
    'import { getFirestore, doc, setDoc, getDoc, disableNetwork } from \'firebase/firestore\';'
  );
  
  const target = `let quotaExceeded = typeof window !== "undefined" && window.sessionStorage.getItem("firebase_quota_exceeded") === "true";`;
  const replace = target + `\n\nif (quotaExceeded && typeof window !== "undefined") {
  // If already disabled from a previous load in this session, immediately disable network to stop SDK retries
  disableNetwork(db).catch(console.error);
}`;
  code = code.replace(target, replace);
  
  const catchTarget = `       if (typeof window !== 'undefined') {
         window.sessionStorage.setItem('firebase_quota_exceeded', 'true');
         window.dispatchEvent(new CustomEvent('baf_quota_exceeded'));
       }`;
  const catchReplace = catchTarget + `\n       disableNetwork(db).catch(console.error);`;
  code = code.replace(catchTarget, catchReplace);
  
  fs.writeFileSync('src/firebase.ts', code);
  console.log('Patched firebase.ts for disableNetwork');
}
