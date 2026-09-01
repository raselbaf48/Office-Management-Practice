const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

const target1 = `let quotaExceeded = typeof window !== "undefined" && window.sessionStorage.getItem("firebase_quota_exceeded") === "true";`;
const replace1 = `const todayDate = new Date().toDateString();
let quotaExceeded = false;
if (typeof window !== "undefined") {
  const saved = window.localStorage.getItem("firebase_quota_exceeded");
  if (saved === todayDate) {
    quotaExceeded = true;
  }
}`;

code = code.replace(target1, replace1);

const target2 = `window.sessionStorage.setItem('firebase_quota_exceeded', 'true');`;
const replace2 = `window.localStorage.setItem('firebase_quota_exceeded', new Date().toDateString());`;

code = code.replaceAll(target2, replace2);

fs.writeFileSync('src/firebase.ts', code);
console.log('Patched localstorage in firebase.ts');
