const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const oldCalc = `  // Grand totals calculation
  const totalSlotsOverall = matrix.reduce((grandSum, table) => {
    return (
      grandSum +
      flights.reduce((fSum, fl) => {
        if (selectedFlightFilter !== 'All' && selectedFlightFilter !== fl) return fSum;
        return fSum + table.data[fl].reduce((dSum, count) => dSum + count, 0);
      }, 0)
    );
  }, 0);`;

const newCalc = `  // Grand totals calculation
  const totalSlotsOverall = matrix.reduce((sum, table) => sum + (table.totalRequiredMonth || 0), 0);`;

code = code.replace(oldCalc, newCalc);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
