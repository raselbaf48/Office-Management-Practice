import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

if (lines[281].includes('</div>') && lines[282].includes(')}')) {
  lines[281] = '';
  lines[282] = '';
}

fs.writeFileSync(path, lines.join('\n'));
