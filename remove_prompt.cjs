const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

const promptCode = `                          const handleDisposalSelect = (val: string) => {
                             if (val === 'Custom') {
                               const customVal = prompt("Enter Custom Disposal:", currentVal);
                               if (customVal !== null) {
                                  setDisposals({ ...disposals, [a.id]: customVal });
                               }
                             } else {
                               setDisposals({ ...disposals, [a.id]: val });
                             }
                          };`;

code = code.replace(promptCode, '');
fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
