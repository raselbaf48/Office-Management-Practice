const fs = require('fs');

const fileList = [
  'src/components/PrintableFlyingWingModal.tsx',
  'src/components/IdaCenterDutyView.tsx',
  'src/components/EntryHistoryModal.tsx',
  'src/components/FlyingWingStateView.tsx'
];

fileList.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let file = fs.readFileSync(filePath, 'utf8');
    let original = file;
    
    // Explicitly enforce 4-digit years where year is configured
    file = file.replace(/year:\s*['"]2-digit['"]/g, "year: 'numeric'");
    file = file.replace(/year:\s*undefined/g, "year: 'numeric'");
    
    if (file !== original) {
      fs.writeFileSync(filePath, file);
      console.log(`Updated to numeric year in ${filePath}`);
    }
  }
});
