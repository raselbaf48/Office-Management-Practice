const fs = require('fs');

let original = fs.readFileSync('settings_copy.tsx', 'utf8');

const getBlock = (startMarker, endMarker) => {
  const start = original.indexOf(startMarker);
  const end = original.indexOf(endMarker, start);
  return original.substring(start, end);
};

const cloudSyncBlock = getBlock("{activeSection === 'cloudsync' && (", "          {/* Section: Users */}");
const usersBlock = getBlock("{activeSection === 'users' && role === 'SUPER_ADMIN' && (", "          {/* Section: Security */}");
const securityBlock = getBlock("{activeSection === 'security' && (", "          {/* Section: Database Backup */}");
const databaseBlock = getBlock("{activeSection === 'database' && (", "          {/* Section: History */}");

// for history, from history start to the closing of history.
const histStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const histStartIdx = original.indexOf(histStart);
// Find the last div sequence
const histEndIdx = original.indexOf("            </div>\n          )}", histStartIdx);
const historyBlock = original.substring(histStartIdx, histEndIdx + "            </div>\n          )}".length);


// verify them
console.log("cloudSync:", cloudSyncBlock.split('<div').length - cloudSyncBlock.split('</div').length);
console.log("users:", usersBlock.split('<div').length - usersBlock.split('</div').length);
console.log("security:", securityBlock.split('<div').length - securityBlock.split('</div').length);
console.log("database:", databaseBlock.split('<div').length - databaseBlock.split('</div').length);
console.log("history:", historyBlock.split('<div').length - historyBlock.split('</div').length);
