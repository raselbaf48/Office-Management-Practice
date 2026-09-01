const fs = require('fs');
let code = fs.readFileSync('src/services/presenceService.ts', 'utf8');

const target1 = `let quotaExceeded = false;`;
const replace1 = `const isQuotaExceeded = () => typeof window !== 'undefined' && window.localStorage.getItem('firebase_quota_exceeded') === new Date().toDateString();`;

code = code.replace(target1, replace1);
code = code.replaceAll('if (quotaExceeded)', 'if (isQuotaExceeded())');
code = code.replaceAll('quotaExceeded = true;', '// quota handled in catch');

const onSnapshotTarget1 = `export const subscribeToActiveUsers = (callback: (users: any[]) => void) => {`;
const onSnapshotReplace1 = `export const subscribeToActiveUsers = (callback: (users: any[]) => void) => {
  if (isQuotaExceeded()) return () => {};`;

code = code.replace(onSnapshotTarget1, onSnapshotReplace1);

const onSnapshotTarget2 = `export const subscribeToLoginHistory = (callback: (logs: any[]) => void) => {`;
const onSnapshotReplace2 = `export const subscribeToLoginHistory = (callback: (logs: any[]) => void) => {
  if (isQuotaExceeded()) return () => {};`;

code = code.replace(onSnapshotTarget2, onSnapshotReplace2);

const catchTarget1 = `       console.warn('Firebase quota exceeded. Presence sync disabled.');`;
const catchReplace1 = `       if (typeof window !== 'undefined') {
         window.localStorage.setItem('firebase_quota_exceeded', new Date().toDateString());
         window.dispatchEvent(new CustomEvent('baf_quota_exceeded'));
       }
       console.warn('Firebase quota exceeded. Presence sync disabled.');`;

code = code.replaceAll(catchTarget1, catchReplace1);

fs.writeFileSync('src/services/presenceService.ts', code);
console.log('Patched presenceService.ts');
