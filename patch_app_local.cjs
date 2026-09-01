const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `const [showQuotaBanner, setShowQuotaBanner] = useState<boolean>(() => typeof window !== "undefined" && window.sessionStorage.getItem("firebase_quota_exceeded") === "true");`;
const replace = `const [showQuotaBanner, setShowQuotaBanner] = useState<boolean>(() => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("firebase_quota_exceeded") === new Date().toDateString();
});`;

code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
console.log('Patched App.tsx');
