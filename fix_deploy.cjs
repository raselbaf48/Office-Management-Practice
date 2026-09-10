const fs = require('fs');
const file = 'src/components/AssignDeploymentTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `                onChange={(e) => {
                  const val = e.target.value;
                  setDeploymentFromDate(val);
                  if (deploymentToDate < val) setDeploymentToDate(val);
                  
                  if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + selectedPresetDays - 1);
                    setDeploymentToDate(d.toISOString().split('T')[0]);
                  }
                }}`;

const replaceCode = `                onChange={(e) => {
                  const val = e.target.value;
                  setDeploymentFromDate(val);
                  
                  if (!deploymentToDate || deploymentToDate < val) {
                    setDeploymentToDate(val);
                  }
                  
                  if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + selectedPresetDays - 1);
                    setDeploymentToDate(d.toISOString().split('T')[0]);
                  }
                }}`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched AssignDeploymentTab date sync!");
