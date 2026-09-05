const fs = require('fs');

let file = 'src/components/LeaveRegisterView.tsx';
let code = fs.readFileSync(file, 'utf8');

// The effect was setting it on EVERY duration change. 
// We should only auto-select if leaveType is currently empty, OR if we cross the 10-day boundary and the old selection becomes invalid.

code = code.replace(
  /\/\/ Auto-select Leave Type based on duration\s*useEffect\(\(\) => \{\s*if \(leaveDurationDays < 10\) \{\s*setLeaveType\('Casual'\);\s*\} else if \(leaveDurationDays >= 10\) \{\s*setLeaveType\('Annual'\);\s*\}\s*\}, \[leaveDurationDays\]\);/,
  `// Auto-select Leave Type based on duration
  useEffect(() => {
    setLeaveType((prev) => {
      // If duration > 10, Casual is invalid. Force it to Annual if it was Casual.
      if (leaveDurationDays > 10) {
        if (prev === 'Casual' || prev === '') return 'Annual';
        return prev;
      }
      // If duration <= 10, auto select Casual ONLY if nothing is currently selected
      if (leaveDurationDays <= 10) {
        if (prev === '') return 'Casual';
        return prev;
      }
      return prev;
    });
  }, [leaveDurationDays]);`
);

// We should also make sure opening the modal resets the leave type to empty.
code = code.replace(
  /onClick=\{\(\) => \{\s*setAirmanToEdit\(null\);\s*setIsAddEditOpen\(true\);\s*\}\}/g, // wait this is app.tsx. Let's find the Add New Entry button
  `onClick={() => { setLeaveType(''); setShowGrantLeaveModal(true); }}`
);

code = code.replace(
  /onClick=\{\(\) => setShowGrantLeaveModal\(true\)\}/g,
  `onClick={() => { setLeaveType(''); setShowGrantLeaveModal(true); }}`
);

// We need to fix the leave duration check. You said "10 diner kom hole" meaning <= 10. 
// The UI logic has "> 10" and "< 10" so exactly 10 behaves weirdly. Let's ensure > 10 disables Casual.

code = code.replace(
  /leaveDurationDays >= 10 \? 'opacity-40/g,
  `leaveDurationDays > 10 ? 'opacity-40`
);
code = code.replace(
  /disabled=\{leaveDurationDays >= 10\}/g,
  `disabled={leaveDurationDays > 10}`
);
code = code.replace(
  /leaveDurationDays >= 10 \? \(/g,
  `leaveDurationDays > 10 ? (`
);
code = code.replace(
  /Duration is ≥ 10 days/g,
  `Duration is > 10 days`
);
code = code.replace(
  /Duration is &lt; 10 days/g,
  `Duration is ≤ 10 days`
);

fs.writeFileSync(file, code);
