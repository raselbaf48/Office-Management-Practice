const fs = require('fs');
const file = 'src/components/DutyRatioConfigPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `                          const req = matrix[settingsTableIdx]?.dailyRequirements?.[idx] ?? (matrix[settingsTableIdx]?.totalRequiredDaily || 0);`;

const replCode = `                          const table = matrix[settingsTableIdx];
                          let req = table?.dailyRequirements?.[idx];
                          if (req === undefined && table) {
                              if (table.totalRequiredDaily && (table.totalRequiredDaily * 31 === table.totalRequiredMonth)) {
                                  req = table.totalRequiredDaily;
                              } else {
                                  req = ['Mechanics', 'Avionics', 'GCS', 'Admin'].reduce((acc, fl) => acc + (table.data[fl as FlightName]?.[idx] || 0), 0);
                              }
                          }`;

content = content.replace(findCode, replCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched DutyRatioConfigPanel.tsx!");
