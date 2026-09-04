const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf8');

const targetBtn = `              <button
                onClick={() => {
                  if (matrix && onMatrixChange) {
                    const newMatrix = [...matrix];
                    newMatrix.push({
                      id: \`custom_\${Date.now()}\`,
                      title: 'New Duty',
                      dutyCode: 'GD',
                      totalRequiredMonth: 0,
                      totalRequiredDaily: 0,
                      data: {
                        Mechanics: Array(31).fill(0),
                        Avionics: Array(31).fill(0),
                        GCS: Array(31).fill(0),
                        Admin: Array(31).fill(0),
                      }
                    });
                    onMatrixChange(newMatrix);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                + Add New
              </button>`;

const newBtn = `              <button
                onClick={() => {
                  setNewDutyName('');
                  setNewDutyFlights(['Mechanics', 'Avionics', 'GCS', 'Admin']);
                  setNewDutyRanks(['MWO', 'SWO', 'WO', 'Sgt', 'Cpl', 'LAC', 'AC-1', 'AC-2']);
                  setIsAddingNewDuty(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                + Add New
              </button>`;

if (code.includes(targetBtn)) {
    code = code.replace(targetBtn, newBtn);
    fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
    console.log("Button updated");
} else {
    console.log("Button target not found");
}
