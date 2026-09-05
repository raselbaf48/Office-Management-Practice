const fs = require('fs');

function fixAssignDuty() {
  let file = 'src/components/AssignDutyModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /if \(selectedPresetDays !== null\) \{\s*const td = new Date\(newDate\);\s*td.setDate\(td.getDate\(\) \+ selectedPresetDays - 1\);\s*setToDate\(td.toISOString\(\).split\('T'\)\[0\]\);\s*\} else \{/,
    `if (selectedPresetDays !== null) {
      const td = new Date(newDate);
      td.setDate(td.getDate() + selectedPresetDays - 1);
      const newTo = td.toISOString().split('T')[0];
      setToDate(newTo);
      updatePresetBasedOnDates(newDate, newTo);
    } else {`
  );

  fs.writeFileSync(file, code);
}

fixAssignDuty();
console.log('Fixed AssignDuty Shift Date');
