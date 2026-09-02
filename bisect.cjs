const fs = require('fs');
let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// I will write out variants and run tsc on them.
const writeAndCheck = (name, replaceRe) => {
  let file = current.replace(replaceRe, "");
  fs.writeFileSync('temp_' + name + '.tsx', file);
  console.log('Testing', name);
};

writeAndCheck("appearance", /\{activeSection === 'appearance'.*?\n              \)}/s);
writeAndCheck("cloudsync", /\{activeSection === 'cloudsync'.*?\n          \)}/s);
writeAndCheck("users", /\{activeSection === 'users'.*?\n          \)}/s);
writeAndCheck("security", /\{activeSection === 'security'.*?\n              \)}/s);
writeAndCheck("database", /\{activeSection === 'database'.*?\n          \)}/s);
writeAndCheck("history", /\{activeSection === 'history'.*?\n          \)}/s);
