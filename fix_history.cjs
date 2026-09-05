const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Define handleDeleteHistoryItem
const targetFunctionStr = `  const handleDeleteConfig = (id: string) => {`;
const newFunctionStr = `  const handleDeleteHistoryItem = (item: any) => {
    const updated = appConfigHistory.filter(h => h.id !== item.id);
    setAppConfigHistory(updated);
    // Ideally update authSession here if you persist it
  };

  const handleDeleteConfig = (id: string) => {`;

if (content.includes(targetFunctionStr)) {
  content = content.replace(targetFunctionStr, newFunctionStr);
} else {
  // Just put it before the return
  const retStr = `  return (`;
  content = content.replace(retStr, newFunctionStr.replace('  const handleDeleteConfig = (id: string) => {', '') + `\n  return (` );
}

// Fix duplicate useEffect
content = content.replace("import React, { useState, useEffect, useEffect", "import React, { useState, useEffect");
content = content.replace("import React, { useState, useEffect }", "import React, { useState, useEffect }"); // maybe it was added twice? I'll just regex it:
content = content.replace(/import React, \{ useState, useEffect, useEffect \} from 'react';/, "import React, { useState, useEffect } from 'react';");
// Let's just fix the double import line if it's there.
content = content.replace("import React, { useState, useEffect\n", "import React, { useState\n"); 
// Let's just blindly use regex to fix it
content = content.replace(/import React, \{ useState, useEffect\nimport React, \{ useState, useEffect \} from 'react';/, "import React, { useState, useEffect } from 'react';");

fs.writeFileSync(file, content);
