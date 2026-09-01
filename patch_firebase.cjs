const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

if (!code.includes('sessionStorage.getItem')) {
  code = code.replace(
    'let quotaExceeded = false;',
    'let quotaExceeded = typeof window !== "undefined" && window.sessionStorage.getItem("firebase_quota_exceeded") === "true";'
  );
  
  const catchBlockTarget = `    if (error?.message?.includes('Quota') || error?.message?.includes('resource-exhausted') || error?.code === 'resource-exhausted') {
       quotaExceeded = true;
       console.warn('Firebase quota exceeded. Cloud sync is disabled for this session.');`;
       
  const catchBlockReplacement = `    if (error?.message?.includes('Quota') || error?.message?.includes('resource-exhausted') || error?.code === 'resource-exhausted') {
       quotaExceeded = true;
       if (typeof window !== 'undefined') {
         window.sessionStorage.setItem('firebase_quota_exceeded', 'true');
         window.dispatchEvent(new CustomEvent('baf_quota_exceeded'));
       }
       console.warn('Firebase quota exceeded. Cloud sync is disabled for this session.');`;
       
  if (code.includes(catchBlockTarget)) {
    code = code.replace(catchBlockTarget, catchBlockReplacement);
    fs.writeFileSync('src/firebase.ts', code);
    console.log('Patched firebase.ts');
  } else {
    console.log('Could not find catch block in firebase.ts');
  }
} else {
  console.log('Already patched');
}
