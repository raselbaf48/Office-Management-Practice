const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

code = code.replace(
  /useState\<'CONTACTS' \| 'SHIFT_TIMES' \| 'RESPONSIBILITIES'\>\('CONTACTS'\);/,
  "useState<'CONTACTS' | 'SHIFT_TIMES' | 'RESPONSIBILITIES' | null>('CONTACTS');"
);

fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);
