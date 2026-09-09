const fs = require('fs');
let content = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

content = content.replace(
  /<Save className="w-4 h-4" \/>\n                <span>Save & Close<\/span>/g,
  `<Check className="w-4 h-4" />
                <span>Done</span>`
);

content = content.replace(
  /onClick=\{\(\) => \{\n                  handleSave\(\);\n                  setSettingsTableIdx\(null\);\n                \}\}/g,
  `onClick={() => { setSettingsTableIdx(null); }}`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', content, 'utf8');
