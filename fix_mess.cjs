const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const errorIndex = content.indexOf("mo, useEffect");
if (errorIndex !== -1) {
  // The original file was basically "import React, { useState, useMe" + content.substring(errorIndex)
  const originalFile = "import React, { useState, useMe" + content.substring(errorIndex);
  fs.writeFileSync('src/components/UserManagementTab_original.tsx', originalFile);
  console.log("Original file recovered!");
}
