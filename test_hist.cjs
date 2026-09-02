const fs = require('fs');
let original = fs.readFileSync('settings_copy.tsx', 'utf8');
const histStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const histStartIdx = original.indexOf(histStart);
const histEndIdx = original.indexOf("            </div>\n          )}", histStartIdx);
const historyBlock = original.substring(histStartIdx, histEndIdx + "            </div>\n          )}".length);
console.log(historyBlock);
