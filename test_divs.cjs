const fs = require('fs');

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const countDivs = (str) => {
  const opens = (str.match(/<div/g) || []).length;
  const closes = (str.match(/<\/div>/g) || []).length;
  return { opens, closes, diff: opens - closes };
};

console.log("appearance:", countDivs(current.substring(current.indexOf("{activeSection === 'appearance'"), current.indexOf("{activeSection === 'cloudsync'"))));
console.log("cloudsync:", countDivs(current.substring(current.indexOf("{activeSection === 'cloudsync'"), current.indexOf("{activeSection === 'users'"))));
console.log("users:", countDivs(current.substring(current.indexOf("{activeSection === 'users'"), current.indexOf("{activeSection === 'security'"))));
console.log("security:", countDivs(current.substring(current.indexOf("{activeSection === 'security'"), current.indexOf("{activeSection === 'database'"))));
console.log("database:", countDivs(current.substring(current.indexOf("{activeSection === 'database'"), current.indexOf("{activeSection === 'history'"))));
console.log("history:", countDivs(current.substring(current.indexOf("{activeSection === 'history'"), current.indexOf("  );"))));
