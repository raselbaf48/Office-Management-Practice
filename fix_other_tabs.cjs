const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /\{label: 'Today', val: 1\}, \{label: '2 Days', val: 2\}/,
    `{label: '1 Day', val: 1}, {label: '2 Days', val: 2}`
  );
  fs.writeFileSync(file, code);
}

fixFile('src/components/TdyRegisterView.tsx');
fixFile('src/components/AssignTdyTab.tsx');
console.log('Fixed other tabs');
