const fs = require('fs');
let lines = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8').split('\n');

// Find the line that has "{/* Table Body (Days 1 to 31) */}"
const tableBodyIndex = lines.findIndex(l => l.includes('{/* Table Body (Days 1 to 31) */}'));
if (tableBodyIndex !== -1 && !lines[tableBodyIndex - 1].includes('</div>')) {
  lines.splice(tableBodyIndex, 0, '              </div>');
}

// Find the line that has "Month Total:" for the selectedFlightFilter
const monthTotalIndex = lines.findIndex(l => l.includes('Month Total: <strong className="font-mono">{flightTotalsOverall[selectedFlightFilter as FlightName]}</strong>'));
if (monthTotalIndex !== -1) {
  // It's followed by </div>. Then it should be followed by another </div> before <div className="overflow-x-auto">
  const nextDiv = monthTotalIndex + 1; // </div>
  const overflowDiv = monthTotalIndex + 2; // <div className="overflow-x-auto">
  if (lines[overflowDiv].includes('overflow-x-auto') && !lines[overflowDiv - 1].includes('</div>              </div>')) {
    lines.splice(overflowDiv, 0, '            </div>');
  }
}

// Fix the end
let endLines = lines.slice(-10);
let closeIndex = lines.length - 1;
while(closeIndex >= 0 && lines[closeIndex].trim() === '') {
  lines.pop();
  closeIndex--;
}
if (lines[lines.length - 1].trim() === ');') {
  lines.push('};');
}
if (!lines.slice(-4).join('').includes('</div>')) {
  lines.pop(); // remove );
  lines.pop(); // remove }; (if present)
  // Need to append properly
  lines.push('      </div>');
  lines.push('    </div>');
  lines.push('  );');
  lines.push('};');
}

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', lines.join('\n'));
