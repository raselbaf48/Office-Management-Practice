const fs = require('fs');
const filesToProcess = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/FlyingWingStateView.tsx',
  'src/components/IdaCenterDutyView.tsx'
];

filesToProcess.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let file = fs.readFileSync(filePath, 'utf8');
    let original = file;
    
    // Replace formatting string to just day and month (no year)
    // Looking for: year: '2-digit'
    file = file.replace(/year:\s*['"]2-digit['"]/g, "year: undefined"); // Setting undefined removes it
    file = file.replace(/year:\s*['"]numeric['"]/g, "year: undefined");
    
    // Ensure the above works by doing an explicit replace
    file = file.replace(/day:\s*'2-digit',\s*month:\s*'short',\s*year:\s*'2-digit'/g, "day: '2-digit', month: 'short'");
    file = file.replace(/month:\s*'short',\s*day:\s*'2-digit',\s*year:\s*'2-digit'/g, "month: 'short', day: '2-digit'");
    
    if (file !== original) {
      fs.writeFileSync(filePath, file);
      console.log(`Updated formats in ${filePath}`);
    }
  }
});
