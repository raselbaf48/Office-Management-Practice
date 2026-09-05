const fs = require('fs');

function fixAssignLeaveTab() {
  const file = 'src/components/AssignLeaveTab.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /onChange=\{\(e\) => \{\s*setLeaveFromDate\(e.target.value\);\s*if \(leaveToDate < e.target.value\) setLeaveToDate\(e.target.value\);\s*setSelectedPresetDays\(null\);\s*setIsCustomPresetActive\(false\);\s*\}\}/g,
    `onChange={(e) => {
                  const val = e.target.value;
                  setLeaveFromDate(val);
                  if (leaveToDate < val) setLeaveToDate(val);
                  
                  if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + selectedPresetDays - 1);
                    setLeaveToDate(d.toISOString().split('T')[0]);
                  } else if (isCustomPresetActive) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + customLeaveDays - 1);
                    setLeaveToDate(d.toISOString().split('T')[0]);
                  }
                }}`
  );
  
  fs.writeFileSync(file, code);
  console.log('Fixed AssignLeaveTab.tsx');
}

function fixLeaveRegisterView() {
  const file = 'src/components/LeaveRegisterView.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /onChange=\{\(e\) => \{\s*const newFrom = e.target.value;\s*setLeaveFromDate\(newFrom\);\s*if \(!leaveToDate \|\| leaveToDate < newFrom\) \{\s*setLeaveToDate\(newFrom\);\s*\}\s*\}\}/g,
    `onChange={(e) => {
                      const newFrom = e.target.value;
                      setLeaveFromDate(newFrom);
                      if (!leaveToDate || leaveToDate < newFrom) {
                        setLeaveToDate(newFrom);
                      }
                      if (selectedPresetDays !== null) {
                        const d = new Date(newFrom);
                        d.setDate(d.getDate() + selectedPresetDays - 1);
                        setLeaveToDate(d.toISOString().split('T')[0]);
                      } else if (isCustomPresetActive) {
                        const d = new Date(newFrom);
                        d.setDate(d.getDate() + customLeaveDays - 1);
                        setLeaveToDate(d.toISOString().split('T')[0]);
                      }
                    }}`
  );
  
  fs.writeFileSync(file, code);
  console.log('Fixed LeaveRegisterView.tsx');
}

function fixAssignDeploymentTab() {
  const file = 'src/components/AssignDeploymentTab.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /onChange=\{\(e\) => \{\s*setDeploymentFromDate\(e.target.value\);\s*if \(deploymentToDate < e.target.value\) setDeploymentToDate\(e.target.value\);\s*setSelectedPresetDays\(null\);\s*\}\}/g,
    `onChange={(e) => {
                  const val = e.target.value;
                  setDeploymentFromDate(val);
                  if (deploymentToDate < val) setDeploymentToDate(val);
                  
                  if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + selectedPresetDays - 1);
                    setDeploymentToDate(d.toISOString().split('T')[0]);
                  }
                }}`
  );
  
  fs.writeFileSync(file, code);
  console.log('Fixed AssignDeploymentTab.tsx');
}

function fixDeploymentRegisterView() {
  const file = 'src/components/DeploymentRegisterView.tsx';
  let code = fs.readFileSync(file, 'utf8');
  
  code = code.replace(
    /onChange=\{\(e\) => \{\s*const newFrom = e.target.value;\s*setAttFromDate\(newFrom\);\s*if \(!attToDate \|\| attToDate < newFrom\) \{\s*setAttToDate\(newFrom\);\s*\}\s*\}\}/g,
    `onChange={(e) => {
                      const newFrom = e.target.value;
                      setAttFromDate(newFrom);
                      if (!attToDate || attToDate < newFrom) {
                        setAttToDate(newFrom);
                      }
                      if (selectedPresetDays !== null) {
                        const d = new Date(newFrom);
                        d.setDate(d.getDate() + selectedPresetDays - 1);
                        setAttToDate(d.toISOString().split('T')[0]);
                      }
                    }}`
  );
  
  code = code.replace(
    /onChange=\{\(e\) => setAttToDate\(e.target.value\)\}/g,
    `onChange={(e) => {
                      setAttToDate(e.target.value);
                      setSelectedPresetDays(null);
                    }}`
  );
  
  fs.writeFileSync(file, code);
  console.log('Fixed DeploymentRegisterView.tsx');
}

fixAssignLeaveTab();
fixLeaveRegisterView();
fixAssignDeploymentTab();
fixDeploymentRegisterView();
