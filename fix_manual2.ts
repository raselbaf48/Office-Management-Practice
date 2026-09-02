import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /            <\/div>\n            <\/div>\n            \)}\n/,
  `            </div>\n`
);

fs.writeFileSync(path, code);
