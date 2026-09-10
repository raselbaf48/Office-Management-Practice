const fs = require('fs');
const file = 'src/components/DutyRatioConfigPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `                                  if (onMatrixChange) {
                                    const updated = [...matrix];
                                    const currentReqs = updated[settingsTableIdx].dailyRequirements || new Array(31).fill(updated[settingsTableIdx].totalRequiredDaily || 0);
                                    currentReqs[idx] = val;
                                    updated[settingsTableIdx].dailyRequirements = currentReqs;
                                    updated[settingsTableIdx].totalRequiredMonth = currentReqs.reduce((a, b) => a + b, 0);
                                    onMatrixChange(updated);
                                  }`;

const replCode = `                                  if (onMatrixChange) {
                                    const updated = [...matrix];
                                    updated[settingsTableIdx] = { ...updated[settingsTableIdx] };
                                    const currentReqs = updated[settingsTableIdx].dailyRequirements || new Array(31).fill(updated[settingsTableIdx].totalRequiredDaily || 0);
                                    currentReqs[idx] = val;
                                    updated[settingsTableIdx].dailyRequirements = currentReqs;
                                    updated[settingsTableIdx].totalRequiredMonth = currentReqs.reduce((a, b) => a + b, 0);
                                    updated[settingsTableIdx] = autoDistributeTableData(updated[settingsTableIdx], manpower);
                                    onMatrixChange(updated);
                                  }`;

content = content.replace(findCode, replCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched calendar!");
