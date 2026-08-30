const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const oldTotalCalc = `  // Grand totals calculation
  const totalSlotsOverall = matrix.reduce((sum, table) => sum + (table.totalRequiredMonth || 0), 0);`;

const newTotalCalc = `  // Grand totals calculation
  const totalSlotsOverall = matrix.reduce((sum, table) => {
    if (selectedFlightFilter === 'Overall') return sum + (table.totalRequiredMonth || 0);
    return sum + (table.flightTargets?.[selectedFlightFilter as 'Mechanics' | 'Avionics' | 'GCS'] || 0);
  }, 0);`;

code = code.replace(oldTotalCalc, newTotalCalc);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
