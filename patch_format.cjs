const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');
content = content.replace(
  /return \`\$\{dayStr\} \$\{monthStr\} \$\{yearStr\}\`;/,
  'return \`\$\{dayStr\} \$\{monthStr\}\`;'
);
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);

// Let's also check DutyRosterPeriodView.tsx just in case
let drContent = fs.readFileSync('src/components/DutyRosterPeriodView.tsx', 'utf-8');
drContent = drContent.replace(
  /return \`\$\{dayStr\} \$\{monthStr\} \$\{yearStr\}\`;/g,
  'return \`\$\{dayStr\} \$\{monthStr\}\`;'
);
fs.writeFileSync('src/components/DutyRosterPeriodView.tsx', drContent);

console.log("Patched date formats");
