const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const oldTotalCalc = `  const totalSlotsOverall = matrix.reduce((grandSum, table) => {
    return (
      grandSum +
      flights.reduce((fSum, fl) => {
        return fSum + table.data[fl].reduce((dSum, count) => dSum + count, 0);
      }, 0)
    );
  }, 0);`;

const newTotalCalc = `  const totalSlotsOverall = matrix.reduce((grandSum, table) => {
    return (
      grandSum +
      flights.reduce((fSum, fl) => {
        if (selectedFlightFilter !== 'All' && selectedFlightFilter !== fl) return fSum;
        return fSum + table.data[fl].reduce((dSum, count) => dSum + count, 0);
      }, 0)
    );
  }, 0);`;

code = code.replace(oldTotalCalc, newTotalCalc);

const oldFlightMap = `{flights.map((fl) => (`;
const newFlightMap = `{flights.filter(fl => selectedFlightFilter === 'All' || selectedFlightFilter === fl).map((fl) => (`;

code = code.replace(oldFlightMap, newFlightMap);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
