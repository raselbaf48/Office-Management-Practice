const fs = require('fs');
let file = fs.readFileSync('src/services/presenceService.ts', 'utf-8');

file = file.replace(
  'const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));',
  'const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));'
);

file = file.replace(
  'const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));',
  'const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));'
);

fs.writeFileSync('src/services/presenceService.ts', file, 'utf-8');
