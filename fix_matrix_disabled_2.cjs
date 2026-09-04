const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

code = code.replace(
  "matrix.forEach((table) => {",
  "matrix.filter(t => !t.isDisabled).forEach((table) => {"
);

code = code.replace(
  "const dailySum = matrix.reduce((sum, table) => sum + (table.data[selectedFlightFilter as FlightName]?.[dayIdx] || 0), 0);",
  "const dailySum = matrix.filter(t => !t.isDisabled).reduce((sum, table) => sum + (table.data[selectedFlightFilter as FlightName]?.[dayIdx] || 0), 0);"
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
