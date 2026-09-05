const fs = require('fs');

let file = 'src/utils/authSession.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /let modified = false;\s*\/\/ Force remove specific user\s*const beforeCount = parsed.length;\s*parsed = parsed.filter\(u => u.bdNo !== 'deleted_admin'\);\s*if \(parsed.length !== beforeCount\) \{/g,
  `let modified = false;

  // Force remove specific user 53539919
  const beforeCount = parsed.length;
  parsed = parsed.filter(u => u.bdNo !== '53539919' && u.bdNo !== 'deleted_admin');
  if (parsed.length !== beforeCount) {
    modified = true;
  }
  
  // Force 48456 to be OWNER
  const ownerIdx = parsed.findIndex(u => u.bdNo === '48456');
  if (ownerIdx >= 0) {
    if (parsed[ownerIdx].role !== 'OWNER') {
      parsed[ownerIdx].role = 'OWNER';
      modified = true;
    }
  } else {
    // If 48456 does not exist in detailed users, let's create a placeholder or wait for them to log in.
  }
  
  if (parsed.length !== beforeCount) {`
);

fs.writeFileSync(file, code);
console.log('Fixed users migration');
