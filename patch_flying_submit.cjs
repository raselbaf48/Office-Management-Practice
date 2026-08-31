const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

const oldSubmit = `  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.unit) return;
    
    const newData = unitsData.map(d => 
      d.unit === addForm.unit ? { ...addForm } : d
    );
    saveData(newData);
    onCloseAddModal();
  };`;

const newSubmit = `  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.unit) return;
    
    const existing = displayData.find(d => d.unit === addForm.unit);
    const existingData = existing || { totalStr: 0, detTdy: 0, leave: 0, edExPpgf: 0, cmhBnsBsh: 0, officeDuty: 0, baseAirfieldDuty: 0, driving: 0 };
    
    // Calculate new values by adding the form values to the existing values
    const updatedUnit = {
      ...addForm,
      totalStr: (existingData.totalStr || 0) + (addForm.totalStr || 0),
      detTdy: (existingData.detTdy || 0) + (addForm.detTdy || 0),
      leave: (existingData.leave || 0) + (addForm.leave || 0),
      edExPpgf: (existingData.edExPpgf || 0) + (addForm.edExPpgf || 0),
      cmhBnsBsh: (existingData.cmhBnsBsh || 0) + (addForm.cmhBnsBsh || 0),
      officeDuty: (existingData.officeDuty || 0) + (addForm.officeDuty || 0),
      baseAirfieldDuty: (existingData.baseAirfieldDuty || 0) + (addForm.baseAirfieldDuty || 0),
      driving: (existingData.driving || 0) + (addForm.driving || 0),
    };

    const newData = displayData.map(d => 
      d.unit === addForm.unit ? updatedUnit : d
    );
    
    // Save log
    let changes = [];
    if (addForm.totalStr) changes.push(\`Total Str +\${addForm.totalStr}\`);
    if (addForm.detTdy) changes.push(\`Det/Tdy +\${addForm.detTdy}\`);
    if (addForm.leave) changes.push(\`Leave +\${addForm.leave}\`);
    if (addForm.edExPpgf) changes.push(\`ED/EX +\${addForm.edExPpgf}\`);
    if (addForm.cmhBnsBsh) changes.push(\`CMH +\${addForm.cmhBnsBsh}\`);
    if (addForm.officeDuty) changes.push(\`Office +\${addForm.officeDuty}\`);
    if (addForm.baseAirfieldDuty) changes.push(\`Base/Airfield +\${addForm.baseAirfieldDuty}\`);
    if (addForm.driving) changes.push(\`Driving +\${addForm.driving}\`);
    
    if (changes.length > 0) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        unit: addForm.unit,
        action: changes.join(', ')
      };
      const existingLogs = JSON.parse(localStorage.getItem(\`flg_wg_logs_\${date}\`) || '[]');
      existingLogs.push(logEntry);
      localStorage.setItem(\`flg_wg_logs_\${date}\`, JSON.stringify(existingLogs));
    }

    saveData(newData);
    onCloseAddModal();
  };`;

file = file.replace(oldSubmit, newSubmit);
fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
