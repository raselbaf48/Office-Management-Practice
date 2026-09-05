const fs = require('fs');
let file = 'src/components/DutyRatioMatrixView.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace tableIdx in the Overall view map
code = code.replace(
  /onClick=\{\(\) => setEditingCalendar\(\{ tableIdx, flight \}\)\}/g,
  'onClick={() => setEditingCalendar({ tableIdx: matrix.findIndex(x => x.id === table.id), flight })}'
);

// Replace tableIdx in the Specific Flight view map
code = code.replace(
  /onClick=\{\(\) => setEditingCalendar\(\{ tableIdx, flight: selectedFlightFilter as FlightName \}\)\}/g,
  'onClick={() => setEditingCalendar({ tableIdx: matrix.findIndex(x => x.id === table.id), flight: selectedFlightFilter as FlightName })}'
);

fs.writeFileSync(file, code);
console.log('Fixed calendar index bug');
