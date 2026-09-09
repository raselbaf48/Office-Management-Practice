const fs = require('fs');
let content = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

content = content.replace(
  /updated\[settingsTableIdx\]\.totalRequiredDaily = val;\n                      setMatrix\(updated\);/g,
  `updated[settingsTableIdx].totalRequiredDaily = val;
                      setMatrix(updated);
                      saveDutyMatrix(updated);`
);

content = content.replace(
  /updated\[settingsTableIdx\]\.dailyRequirements = currentReqs;\n                            setMatrix\(updated\);/g,
  `updated[settingsTableIdx].dailyRequirements = currentReqs;
                            setMatrix(updated);
                            saveDutyMatrix(updated);`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', content, 'utf8');
