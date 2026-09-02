import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('placeholder="User PIN"')) {
    let removeCount = 0;
    if (lines[i+3].includes('</div>')) {
      lines[i+3] = '';
      console.log('Cleared i+3');
    }
    if (lines[i+4].includes(')}')) {
      lines[i+4] = '';
      console.log('Cleared i+4');
    }
    break;
  }
}
fs.writeFileSync(path, lines.join('\n'));
