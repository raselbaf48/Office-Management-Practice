const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  const lsKey = file.includes('Parade') ? 'parade_historical_custom' : 'nc_historical_custom';
  
  code = code.replace(
    "const lsKey = file.includes('Parade') ? 'parade_historical_custom' : 'nc_historical_custom';",
    `const lsKey = '${lsKey}';`
  );

  fs.writeFileSync(file, code);
  console.log('Fixed', file);
});
