const fs = require('fs');
const file = 'src/components/PrintableDutyRatioModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `                          const i = d - 1;
                          const req = table.dailyRequirements?.[i] || table.totalRequiredDaily || 0;
                          return <td key={i} className="border border-black p-1">{req > 0 ? req : ''}</td>;`;

const replCode = `                          const i = d - 1;
                          let req = table.dailyRequirements?.[i];
                          if (req === undefined) {
                              if (table.totalRequiredDaily && (table.totalRequiredDaily * 31 === table.totalRequiredMonth)) {
                                  req = table.totalRequiredDaily;
                              } else {
                                  req = ['Mechanics', 'Avionics', 'GCS', 'Admin'].reduce((acc, fl) => acc + (table.data[fl as FlightName]?.[i] || 0), 0);
                              }
                          }
                          return <td key={i} className="border border-black p-1">{req > 0 ? req : ''}</td>;`;

content = content.replace(findCode, replCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched PrintableDutyRatioModal.tsx!");
