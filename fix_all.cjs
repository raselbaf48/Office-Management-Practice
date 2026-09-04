const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

// Fix delete button confirmation
code = code.replace(
  "if (onMatrixChange && window.confirm('Are you sure you want to delete this duty?')) {",
  "if (onMatrixChange && confirm('Are you sure you want to delete this duty?')) {"
);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
