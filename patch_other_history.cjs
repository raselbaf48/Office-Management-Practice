const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    "const handleRemoveDisposalOption = (label: string) => {\n    const updated = savedDisposals.filter(d => d.label !== label);",
    "const handleRemoveDisposalOption = (label: string) => {\n    const removed = savedDisposals.find(d => d.label === label);\n    if (removed && removed.code === 'OTHERS' && removed.customTitle && !historicalCustomCats.some(h => h.customTitle === removed.customTitle)) {\n      const newHistory = [...historicalCustomCats, removed];\n      setHistoricalCustomCats(newHistory);\n      const lsKey = file.includes('Parade') ? 'parade_historical_custom' : 'nc_historical_custom';\n      localStorage.setItem(lsKey, JSON.stringify(newHistory));\n    }\n    const updated = savedDisposals.filter(d => d.label !== label);"
  );

  fs.writeFileSync(file, code);
  console.log('Patched', file);
});
