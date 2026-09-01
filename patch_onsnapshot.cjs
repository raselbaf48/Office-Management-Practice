const fs = require('fs');
let code = fs.readFileSync('src/services/presenceService.ts', 'utf8');

if (!code.includes('disableNetwork(db)')) {
  // add disableNetwork to imports
  code = code.replace(
    `import { doc, setDoc, onSnapshot, serverTimestamp, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';`,
    `import { doc, setDoc, onSnapshot, serverTimestamp, collection, query, orderBy, limit, addDoc, disableNetwork } from 'firebase/firestore';`
  );

  const target1 = `    callback(active);
  });`;
  const replace1 = `    callback(active);
  }, (err: any) => {
    if (err?.message?.includes('Quota') || err?.message?.includes('resource-exhausted') || err?.code === 'resource-exhausted') {
       if (typeof window !== 'undefined') {
         window.localStorage.setItem('firebase_quota_exceeded', new Date().toDateString());
         window.dispatchEvent(new CustomEvent('baf_quota_exceeded'));
       }
       disableNetwork(db).catch(console.error);
       console.warn('Firebase quota exceeded in onSnapshot. Network disabled.');
    }
  });`;
  
  code = code.replace(target1, replace1);

  const target2 = `    callback(logs);
  });`;
  const replace2 = `    callback(logs);
  }, (err: any) => {
    if (err?.message?.includes('Quota') || err?.message?.includes('resource-exhausted') || err?.code === 'resource-exhausted') {
       if (typeof window !== 'undefined') {
         window.localStorage.setItem('firebase_quota_exceeded', new Date().toDateString());
         window.dispatchEvent(new CustomEvent('baf_quota_exceeded'));
       }
       disableNetwork(db).catch(console.error);
       console.warn('Firebase quota exceeded in onSnapshot. Network disabled.');
    }
  });`;

  code = code.replace(target2, replace2);
  fs.writeFileSync('src/services/presenceService.ts', code);
  console.log('Patched onSnapshot handlers');
} else {
  console.log('Already patched');
}
