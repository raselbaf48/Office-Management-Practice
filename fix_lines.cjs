const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Print around 715-725 to see
console.log("Original 715-725:");
for(let i=714; i<=724; i++) console.log(i+1, lines[i]);

// Replace
lines[718] = '                  </div>)}';
lines[719] = ''; // remove </div></div>)}

console.log("Original 815-825:");
for(let i=814; i<=824; i++) console.log(i+1, lines[i]);

lines[817] = '                  </div>)}';
lines[818] = '';

console.log("Original 1115-1120:");
for(let i=1114; i<=1119; i++) console.log(i+1, lines[i]);
// wait, line 1118 is 1112 in original maybe?
// I will just save the lines for 718, 719, 817, 818.
fs.writeFileSync(file, lines.join('\n'));
