const fs = require('fs');
let original = fs.readFileSync('settings_copy.tsx', 'utf8');
let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const getBlock = (startString, endString) => {
  const start = original.indexOf(startString);
  if (start === -1) return null;
  const end = original.indexOf(endString, start);
  if (end === -1) return null;
  return original.substring(start, end + endString.length);
};

const cloudSyncBlock = getBlock("{activeSection === 'cloudsync' && (", "          )}");
const usersBlock = getBlock("{activeSection === 'users' && role === 'SUPER_ADMIN' && (", "          )}");
const databaseBlock = getBlock("{activeSection === 'database' && role === 'SUPER_ADMIN' && (", "          )}");
const historyBlock = getBlock("{activeSection === 'history' && role === 'SUPER_ADMIN' && (", "          )}");

const targetStart = "{/* Other sections would go here";
const targetEnd = "              )}";
const startIdx = current.indexOf(targetStart);
// Find the 4th occurrence of `              )}` after startIdx
let endIdx = startIdx;
for(let i=0; i<4; i++) {
  endIdx = current.indexOf("              )}", endIdx + 1);
}
endIdx += "              )}".length;

const before = current.substring(0, startIdx);
const after = current.substring(endIdx);

fs.writeFileSync('src/components/SettingsModal.tsx', before + cloudSyncBlock + '\n\n' + usersBlock + '\n\n' + databaseBlock + '\n\n' + historyBlock + after);
console.log('Fixed properly');
