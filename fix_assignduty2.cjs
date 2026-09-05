const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add helper logic to determine selected preset
const helperLogic = `
  const updatePresetBasedOnDates = (start: string, end: string) => {
    if (!start || !end) return;
    const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24)) + 1;
    if ([1, 2, 3, 7, 15].includes(diff)) {
      setSelectedPresetDays(diff);
    } else {
      setSelectedPresetDays(null);
    }
  };
`;

// we need to add this helper somewhere inside the component. Let's just put it near handleShiftDate.
code = code.replace(
  /const handleShiftDate = \(days: number\) => \{/,
  helperLogic + '\n  const handleShiftDate = (days: number) => {'
);

code = code.replace(
  /onChange=\{\(e\) => \{\s*const val = e.target.value;\s*setFromDate\(val\);\s*if \(toDate < val\) setToDate\(val\);\s*if \(selectedPresetDays === 1\) \{\s*setToDate\(val\);\s*\} else if \(selectedPresetDays !== null\) \{\s*const d = new Date\(val\);\s*d.setDate\(d.getDate\(\) \+ selectedPresetDays - 1\);\s*setToDate\(d.toISOString\(\).split\('T'\)\[0\]\);\s*\}\s*\}\}/,
  `onChange={(e) => {
                  const val = e.target.value;
                  setFromDate(val);
                  
                  if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + selectedPresetDays - 1);
                    setToDate(d.toISOString().split('T')[0]);
                  } else {
                    if (toDate < val) {
                      setToDate(val);
                      setSelectedPresetDays(1);
                    } else {
                      updatePresetBasedOnDates(val, toDate);
                    }
                  }
                }}`
);

code = code.replace(
  /onChange=\{\(e\) => \{\s*setToDate\(e.target.value\);\s*setSelectedPresetDays\(null\);\s*\}\}/,
  `onChange={(e) => {
                      const newTo = e.target.value;
                      setToDate(newTo);
                      updatePresetBasedOnDates(fromDate, newTo);
                    }}`
);

code = code.replace(
  /const handleShiftDate = \(days: number\) => \{\s*if \(\!fromDate\) return;\s*const d = new Date\(fromDate\);\s*d.setDate\(d.getDate\(\) \+ days\);\s*const newDate = d.toISOString\(\).split\('T'\)\[0\];\s*setFromDate\(newDate\);\s*if \(selectedPresetDays !== null\) \{\s*const td = new Date\(newDate\);\s*td.setDate\(td.getDate\(\) \+ selectedPresetDays - 1\);\s*setToDate\(td.toISOString\(\).split\('T'\)\[0\]\);\s*\} else \{\s*if \(toDate < newDate\) setToDate\(newDate\);\s*\}\s*\};/,
  `const handleShiftDate = (days: number) => {
    if (!fromDate) return;
    const d = new Date(fromDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    setFromDate(newDate);
    if (selectedPresetDays !== null) {
      const td = new Date(newDate);
      td.setDate(td.getDate() + selectedPresetDays - 1);
      setToDate(td.toISOString().split('T')[0]);
    } else {
      if (toDate < newDate) {
        setToDate(newDate);
        setSelectedPresetDays(1);
      } else {
        updatePresetBasedOnDates(newDate, toDate);
      }
    }
  };`
);


// Flight selection part
// We need to change the activeFlight buttons in AssignDutyModal
// Let's find how flights are mapped. It might be: (['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as (FlightName | 'All')[]).map((flt) => ...
// or something similar.

fs.writeFileSync(file, code);
console.log('Fixed Assignduty dates logic');
