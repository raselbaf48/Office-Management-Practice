const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

content = content.replace(
  /if \(type === 'today'\) \{/g,
  "if (type === 'today') {\n      setDateMode('single');"
);

content = content.replace(
  /\} else if \(type === '7days'\) \{/g,
  "} else if (type === '7days') {\n      setDateMode('multi');"
);

content = content.replace(
  /\} else if \(type === '15days'\) \{/g,
  "} else if (type === '15days') {\n      setDateMode('multi');"
);

content = content.replace(
  /\} else if \(type === 'month'\) \{/g,
  "} else if (type === 'month') {\n      setDateMode('multi');"
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
