const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/&&\s*sessionStorage\.getItem\('baf_user_role'\)\s*===\s*'SUPER_ADMIN'\s*/g, '');
    fs.writeFileSync(file, content);
    console.log(`Patched role in ${file}`);
  }
}
