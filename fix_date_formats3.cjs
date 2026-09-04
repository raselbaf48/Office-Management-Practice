const fs = require('fs');

const fileList = [
  'src/components/DashboardParadeState.tsx',
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
    
    // Convert 2-digit years to full numeric where years are used
    file = file.replace(/year:\s*['"]2-digit['"]/g, "year: 'numeric'");
    
    // In DashboardParadeState.tsx, keep the specific removal for the header
    if (filePath === 'src/components/DashboardParadeState.tsx') {
      // already did this above
    }
    
    if (file !== original) {
      fs.writeFileSync(filePath, file);
      console.log(`Fixed year format to 4 digits in ${filePath}`);
    }
  }
});
