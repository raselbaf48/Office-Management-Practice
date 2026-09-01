const fs = require('fs');

let content = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

// Update select dropdown logic to pre-fill existing data and apply amber border
const oldSelect = `<select 
                  required
                  value={addForm.unit}
                  onChange={(e) => setAddForm({...addForm, unit: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >`;

const newSelect = `<select 
                  required
                  value={addForm.unit}
                  onChange={(e) => {
                    const selectedUnit = e.target.value;
                    const existing = displayData.find(d => d.unit === selectedUnit);
                    setAddForm({
                      unit: selectedUnit,
                      totalStr: existing?.totalStr || 0,
                      detTdy: existing?.detTdy || 0,
                      leave: existing?.leave || 0,
                      edExPpgf: existing?.edExPpgf || 0,
                      cmhBnsBsh: existing?.cmhBnsBsh || 0,
                      officeDuty: existing?.officeDuty || 0,
                      baseAirfieldDuty: existing?.baseAirfieldDuty || 0,
                      driving: existing?.driving || 0,
                    });
                  }}
                  className={\`w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 \${!addForm.unit ? 'border-amber-400 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-200 dark:border-slate-700'}\`}
                >`;

content = content.replace(oldSelect, newSelect);

// Update handleSubmit to replace values instead of adding
const oldSubmitBody = `    // Calculate new values by adding the form values to the existing values
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
    if (addForm.driving) changes.push(\`Driving +\${addForm.driving}\`);`;

const newSubmitBody = `    // Use the absolute values from the form
    const updatedUnit = {
      ...existingData,
      ...addForm
    };

    const newData = displayData.map(d => 
      d.unit === addForm.unit ? updatedUnit : d
    );
    
    // Save log
    let changes = [];
    if (addForm.totalStr !== existingData.totalStr) changes.push(\`Total Str: \${existingData.totalStr} ➔ \${addForm.totalStr}\`);
    if (addForm.detTdy !== existingData.detTdy) changes.push(\`Det/Tdy: \${existingData.detTdy} ➔ \${addForm.detTdy}\`);
    if (addForm.leave !== existingData.leave) changes.push(\`Leave: \${existingData.leave} ➔ \${addForm.leave}\`);
    if (addForm.edExPpgf !== existingData.edExPpgf) changes.push(\`ED/EX: \${existingData.edExPpgf} ➔ \${addForm.edExPpgf}\`);
    if (addForm.cmhBnsBsh !== existingData.cmhBnsBsh) changes.push(\`CMH: \${existingData.cmhBnsBsh} ➔ \${addForm.cmhBnsBsh}\`);
    if (addForm.officeDuty !== existingData.officeDuty) changes.push(\`Office: \${existingData.officeDuty} ➔ \${addForm.officeDuty}\`);
    if (addForm.baseAirfieldDuty !== existingData.baseAirfieldDuty) changes.push(\`Base/Airfield: \${existingData.baseAirfieldDuty} ➔ \${addForm.baseAirfieldDuty}\`);
    if (addForm.driving !== existingData.driving) changes.push(\`Driving: \${existingData.driving} ➔ \${addForm.driving}\`);`;

content = content.replace(oldSubmitBody, newSubmitBody);

fs.writeFileSync('src/components/FlyingWingStateView.tsx', content, 'utf-8');
console.log('Updated form logic');
