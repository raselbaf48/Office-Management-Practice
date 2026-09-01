const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf8');

if (!code.includes('setLogLevel')) {
  code = code.replace(
    `import { getFirestore, doc, setDoc, getDoc, disableNetwork } from 'firebase/firestore';`,
    `import { getFirestore, doc, setDoc, getDoc, disableNetwork, setLogLevel } from 'firebase/firestore';`
  );

  const target = `if (quotaExceeded && typeof window !== "undefined") {
  // If already disabled from a previous load in this session, immediately disable network to stop SDK retries
  disableNetwork(db).catch(console.error);
}`;

  const replace = `if (quotaExceeded && typeof window !== "undefined") {
  setLogLevel('silent');
  disableNetwork(db).catch(() => {});
}`;

  code = code.replace(target, replace);
  
  // also suppress the global console.error in case the SDK still leaks errors to console.error directly
  const suppress = `
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (args.some(arg => typeof arg === 'string' && arg.includes('resource-exhausted'))) return;
    if (args.some(arg => arg?.code === 'resource-exhausted')) return;
    originalError(...args);
  };
}
`;
  code = code + suppress;

  fs.writeFileSync('src/firebase.ts', code);
  console.log('Patched log level and console.error');
} else {
  console.log('Already patched');
}
