const fs = require('fs');
let lines = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8').split('\n');

// 1. First map (Overall)
const firstIndex = lines.findIndex(l => l.includes('{/* Table Body (Days 1 to 31) */}'));
if (firstIndex !== -1 && !lines[firstIndex - 1].includes('</div>')) {
  lines.splice(firstIndex, 0, '              </div>');
}

// 2. Second map (!= Overall)
const secondIndex = lines.findIndex(l => l.includes('Month Total: <strong className="font-mono">{flightTotalsOverall[selectedFlightFilter as FlightName]}</strong>'));
if (secondIndex !== -1) {
  const nextDiv = secondIndex + 1; // </div>
  const overflowDiv = secondIndex + 2; // <div className="overflow-x-auto">
  if (lines[overflowDiv].includes('overflow-x-auto') && !lines[overflowDiv - 1].includes('</div>              </div>')) {
    lines.splice(overflowDiv, 0, '            </div>');
  }
}

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', lines.join('\n'));
