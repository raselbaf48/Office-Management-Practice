const fs = require('fs');
let clean = fs.readFileSync('generate_clean.cjs', 'utf8');

const getVar = (name) => {
  let r = new RegExp('const ' + name + ' = `([\\s\\S]*?)`;');
  let m = clean.match(r);
  return m ? m[1] : '';
}
let securityBlock = getVar('securityBlock');

let current = fs.readFileSync('temp_base.tsx', 'utf8');
let beforeEnd = current.substring(0, current.lastIndexOf('            </div>'));
let afterEnd = current.substring(current.lastIndexOf('            </div>'));

fs.writeFileSync('temp_security.tsx', beforeEnd + securityBlock + afterEnd);
