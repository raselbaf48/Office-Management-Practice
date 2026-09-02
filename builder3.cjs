const fs = require('fs');

let clean = fs.readFileSync('generate_clean.cjs', 'utf8');

const getVar = (name) => {
  let r = new RegExp('const ' + name + ' = `([\\s\\S]*?)`;');
  let m = clean.match(r);
  return m ? m[1] : '';
}
let secBlock = getVar('securityBlock').replace(/\\`/g, '`').replace(/\\\$/g, '$');

let orig = fs.readFileSync('settings_copy.tsx', 'utf8');
const getBlock = (startMarker, endMarker) => {
  const start = orig.indexOf(startMarker);
  const end = orig.indexOf(endMarker, start);
  return orig.substring(start, end);
};
const cloudSyncBlock = getBlock("{activeSection === 'cloudsync' && (", "          {/* Section: Users */}");
const usersBlock = getBlock("{activeSection === 'users' && role === 'SUPER_ADMIN' && (", "          {/* Section: Security */}");
const databaseBlock = getBlock("{activeSection === 'database' && (", "          {/* Section: History */}");

const histStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const histStartIdx = orig.indexOf(histStart);
const histEndIdx = orig.indexOf("            </div>\n          )}", histStartIdx);
const historyBlock = orig.substring(histStartIdx, histEndIdx + "            </div>\n          )}".length);


let current = fs.readFileSync('temp_base.tsx', 'utf8');
let beforeEnd = current.substring(0, current.lastIndexOf('            </div>'));
let afterEnd = current.substring(current.lastIndexOf('            </div>'));

// Test combinations
const writeAndCheck = (name, content) => {
  fs.writeFileSync('temp_' + name + '.tsx', beforeEnd + content + afterEnd);
}

writeAndCheck("c", cloudSyncBlock);
writeAndCheck("u", usersBlock);
writeAndCheck("s", secBlock);
writeAndCheck("d", databaseBlock);
writeAndCheck("h", historyBlock);
