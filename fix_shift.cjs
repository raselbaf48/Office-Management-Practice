const fs = require('fs');

function fixAssignDuty() {
  let file = 'src/components/AssignDutyModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /if \(selectedPresetDays !== null\) \{\s*const td = new Date\(newDate\);\s*td.setDate\(td.getDate\(\) \+ selectedPresetDays - 1\);\s*const newTo = td.toISOString\(\).split\('T'\)\[0\];\s*setToDate\(newTo\);\s*updatePresetBasedOnDates\(newDate, newTo\);\s*\}/,
    `if (selectedPresetDays !== null) {
      const td = new Date(newDate);
      const spanDays = selectedPresetDays === -1 ? 1 : selectedPresetDays;
      td.setDate(td.getDate() + spanDays - 1);
      const newTo = td.toISOString().split('T')[0];
      setToDate(newTo);
      updatePresetBasedOnDates(newDate, newTo);
    }`
  );
  
  // Need to also fix DateNavigator onChange just in case!
  code = code.replace(
    /const d = new Date\(val\);\s*d.setDate\(d.getDate\(\) \+ Math.abs\(selectedPresetDays\) - 1\);\s*\/\/ Handle -1 and 1 appropriately. Actually if it's -1, we want 1 day diff\s*const newTo = d.toISOString\(\).split\('T'\)\[0\];/,
    `const d = new Date(val);
                    const spanDays = selectedPresetDays === -1 ? 1 : selectedPresetDays;
                    d.setDate(d.getDate() + spanDays - 1); 
                    const newTo = d.toISOString().split('T')[0];`
  );

  fs.writeFileSync(file, code);
}
fixAssignDuty();
console.log('Fixed Shift Date spanDays logic');
