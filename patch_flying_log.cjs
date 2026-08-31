const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

const oldLog = `      const logEntry = {
        timestamp: new Date().toISOString(),
        unit: addForm.unit,
        action: changes.join(', ')
      };`;

const newLog = `      const logEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        unit: addForm.unit,
        action: changes.join(', '),
        raw: {
          totalStr: addForm.totalStr || 0,
          detTdy: addForm.detTdy || 0,
          leave: addForm.leave || 0,
          edExPpgf: addForm.edExPpgf || 0,
          cmhBnsBsh: addForm.cmhBnsBsh || 0,
          officeDuty: addForm.officeDuty || 0,
          baseAirfieldDuty: addForm.baseAirfieldDuty || 0,
          driving: addForm.driving || 0
        }
      };`;

file = file.replace(oldLog, newLog);

// Add an event listener to reload data if it gets updated from elsewhere
const hookStr = `  useEffect(() => {
    setUnitsData(getSavedData());
  }, [date]);`;

const newHookStr = `  useEffect(() => {
    setUnitsData(getSavedData());
    
    const handleUpdate = (e: any) => {
      if (e.detail === date) {
         setUnitsData(getSavedData());
      }
    };
    window.addEventListener('flg_wg_data_updated', handleUpdate);
    return () => window.removeEventListener('flg_wg_data_updated', handleUpdate);
  }, [date]);`;

if(file.includes(hookStr)) {
  file = file.replace(hookStr, newHookStr);
}

fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
