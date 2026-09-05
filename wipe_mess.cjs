const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const errorIndex = content.indexOf("mo, useEffect } from 'react';");
if (errorIndex !== -1) {
  content = content.substring(0, errorIndex);
  fs.writeFileSync(file, content);
}
console.log("Wiped mess!");
