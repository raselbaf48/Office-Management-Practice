import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('placeholder="User PIN"')) {
    // Next line is />
    // Next line is </div>
    // Next line is </div>
    // Next line is )}
    console.log(lines[i+1]);
    console.log(lines[i+2]);
    console.log(lines[i+3]);
    console.log(lines[i+4]);
    
    if (lines[i+3].includes('</div>') && lines[i+4].includes(')}')) {
      lines.splice(i+3, 2);
      console.log('Removed successfully!');
    }
    break;
  }
}
fs.writeFileSync(path, lines.join('\n'));
