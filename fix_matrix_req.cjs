const fs = require('fs');
const file = 'src/components/DutyRatioMatrixView.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `                          const dailyReq = table.dailyRequirements?.[dayIdx] ?? (table.totalRequiredDaily || 0);`;

const replCode = `                          let dailyReq = table.dailyRequirements?.[dayIdx];
                          if (dailyReq === undefined) {
                              if (table.totalRequiredDaily && (table.totalRequiredDaily * 31 === table.totalRequiredMonth)) {
                                  dailyReq = table.totalRequiredDaily;
                              } else {
                                  dailyReq = ['Mechanics', 'Avionics', 'GCS', 'Admin'].reduce((acc, fl) => acc + (table.data[fl as FlightName]?.[dayIdx] || 0), 0);
                              }
                          }`;

content = content.replace(findCode, replCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched DutyRatioMatrixView.tsx!");
