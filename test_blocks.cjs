const fs = require('fs');

let original = fs.readFileSync('settings_copy.tsx', 'utf8');

const getBlock = (startStr, endStr) => {
  const start = original.indexOf(startStr);
  if (start === -1) return null;
  const end = original.indexOf(endStr, start);
  return original.substring(start, end + endStr.length);
};

console.log("cloudSync:", getBlock("{activeSection === 'cloudsync' && (", "          )}").length);
console.log("users:", getBlock("{activeSection === 'users' && role === 'SUPER_ADMIN' && (", "          )}").length);
console.log("database:", getBlock("{activeSection === 'database' && role === 'SUPER_ADMIN' && (", "          )}").length);
const historyStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const historyIdx = original.indexOf(historyStart);
const historyEndStr = "            </div>\n          )}";
const histEndIdx = original.indexOf(historyEndStr, historyIdx);
console.log("history:", original.substring(historyIdx, histEndIdx + historyEndStr.length).length);
