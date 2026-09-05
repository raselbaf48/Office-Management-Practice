const fs = require('fs');

let file = 'src/utils/authSession.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /if \(parsed.length !== beforeCount\) \{\s*try \{ localStorage\.setItem\(DETAILED_USERS_KEY, JSON\.stringify\(parsed\)\); \} catch \{\}\s*\}/,
  `if (modified) {
    try { localStorage.setItem(DETAILED_USERS_KEY, JSON.stringify(parsed)); } catch {}
  }`
);

fs.writeFileSync(file, code);
console.log('Fixed Auth Migration');
