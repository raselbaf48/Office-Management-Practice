const fs = require('fs');

const fileList = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/FlyingWingStateView.tsx',
  'src/components/IdaCenterDutyView.tsx'
];

fileList.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let file = fs.readFileSync(filePath, 'utf8');
    let original = file;
    
    // Explicitly replace any remaining year: '2-digit' with year: 'numeric'
    // in formatting function definitions
    file = file.replace(/year:\s*['"]2-digit['"]/g, "year: 'numeric'");
    
    // Make sure we catch `toLocaleDateString` instances where the format object is missing year completely
    // if the user wants `dd mm yyyy` (e.g. `04 Sep 2026`) when year is included.
    // 'en-GB' default includes 4-digit year anyway if we use { day: '2-digit', month: 'short', year: 'numeric' }
    
    if (file !== original) {
      fs.writeFileSync(filePath, file);
      console.log(`Updated to numeric year in ${filePath}`);
    }
  }
});
