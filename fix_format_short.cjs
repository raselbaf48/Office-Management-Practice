const fs = require('fs');

const files = ['src/components/ParadeStateFormattedView.tsx', 'src/components/DutyRosterPeriodView.tsx'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(
    /const yearStr = String\(dateObj\.getFullYear\(\)\)\.slice\(-2\);\n\s*return \`\$\{dayStr\} \$\{monthStr\}\`;/g,
    "const yearStr = String(dateObj.getFullYear()).slice(-2);\n    return \`\${dayStr} \${monthStr} \${yearStr}\`;"
  );
  fs.writeFileSync(file, content);
}
