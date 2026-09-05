const fs = require('fs');

function fixAssignDuty() {
  let file = 'src/components/AssignDutyModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /if \(selectedPresetDays !== null\) \{\s*const d = new Date\(val\);\s*d.setDate\(d.getDate\(\) \+ selectedPresetDays - 1\);\s*setToDate\(d.toISOString\(\).split\('T'\)\[0\]\);\s*\}/,
    `if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + Math.abs(selectedPresetDays) - 1); // Handle -1 and 1 appropriately. Actually if it's -1, we want 1 day diff
                    const newTo = d.toISOString().split('T')[0];
                    setToDate(newTo);
                    updatePresetBasedOnDates(val, newTo);
                  }`
  );

  // Wait, if selectedPresetDays is -1, Math.abs(-1) is 1.
  // d.setDate(d.getDate() + 1 - 1) = d.getDate(). Which means newTo = val. This is correct for 1 day span!
  // And updatePresetBasedOnDates(val, newTo) will correctly set selectedPresetDays to 1 or -1 based on whether it is today!
  
  fs.writeFileSync(file, code);
}
fixAssignDuty();
console.log('Fixed AssignDuty onChange preset update');
