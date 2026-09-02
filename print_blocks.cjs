const fs = require('fs');

let original = fs.readFileSync('settings_copy.tsx', 'utf8');

const getBlock = (startStr, endStr) => {
  const start = original.indexOf(startStr);
  if (start === -1) return null;
  const end = original.indexOf(endStr, start);
  return original.substring(start, end + endStr.length);
};

const databaseBlock = getBlock("{activeSection === 'database' && (", "          )}");
console.log(databaseBlock);
