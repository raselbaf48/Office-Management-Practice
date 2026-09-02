import fs from 'fs';

const path = 'src/components/UserManagementTab.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the line that has "User PIN" and remove the rogue closing tags after it.
let lineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('placeholder="User PIN"') && lines[i-1].includes('className="w-full md:w-1/2')) {
    lineIdx = i;
    break;
  }
}

if (lineIdx !== -1) {
  // lineIdx is the placeholder="User PIN" line.
  // Next line is />
  // Next is </div>
  // Then there are 2 bad lines: </div> and )}
  const badStart = lineIdx + 2;
  if (lines[badStart].trim() === '</div>' && lines[badStart + 1].trim() === ')}') {
    lines.splice(badStart, 2);
    console.log('Removed bad lines at', badStart);
  }
}

fs.writeFileSync(path, lines.join('\n'));
