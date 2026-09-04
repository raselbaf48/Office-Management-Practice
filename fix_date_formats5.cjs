const fs = require('fs');

const fileList = [
  'src/components/DashboardParadeState.tsx',
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/FlyingWingStateView.tsx',
  'src/components/IdaCenterDutyView.tsx',
  'src/components/MonthlyDutyRegister.tsx',
  'src/components/EntryHistoryModal.tsx'
];

fileList.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let file = fs.readFileSync(filePath, 'utf8');
    let original = file;
    
    // Explicitly enforce 4-digit years where year is configured
    file = file.replace(/year:\s*['"]2-digit['"]/g, "year: 'numeric'");
    
    // Some formats might be constructed with `.replace(/ /g, ' ')` etc.
    if (file !== original) {
      fs.writeFileSync(filePath, file);
      console.log(`Updated to numeric year in ${filePath}`);
    }
  }
});
