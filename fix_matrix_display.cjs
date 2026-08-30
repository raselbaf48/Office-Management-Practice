const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// 1. Change the filter options in the top filter bar
// Find: ['All', ...flights].map((f) => (
// Change to: ['Overall', 'Mechanics', 'Avionics', 'GCS'].map((f) => (

code = code.replace(
  /\{\['All', \.\.\.flights\]\.map\(\(f\) => \(/g,
  "{['Overall', 'Mechanics', 'Avionics', 'GCS'].map((f) => ("
);

// 2. We need to update selectedFlightFilter usages. It was typed as `FlightName | 'All'`.
// If `selectedFlightFilter === 'Overall'`, it means 'All'.
// Let's replace 'All' with 'Overall' in the state initialization.
code = code.replace(
  /const \[selectedFlightFilter, setSelectedFlightFilter\] = useState<FlightName \| 'All'>\('All'\);/g,
  "const [selectedFlightFilter, setSelectedFlightFilter] = useState<FlightName | 'Overall'>('Overall');"
);

code = code.replace(
  /selectedFlightFilter === 'All'/g,
  "selectedFlightFilter === 'Overall'"
);

// 3. Update Month Total display in the table header
// Currently: Month Total: <strong className="font-mono">{table.totalRequiredMonth || 0}</strong>
const oldMonthTotal = `Month Total: <strong className="font-mono">{table.totalRequiredMonth || 0}</strong>`;
const newMonthTotal = `Month Total: <strong className="font-mono">
                        {selectedFlightFilter === 'Overall' 
                          ? (table.totalRequiredMonth || 0) 
                          : (table.flightTargets?.[selectedFlightFilter as 'Mechanics' | 'Avionics' | 'GCS'] || 0)}
                      </strong>`;
code = code.replace(oldMonthTotal, newMonthTotal);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
