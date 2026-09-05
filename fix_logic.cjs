const fs = require('fs');

function fixAssignDuty() {
  let file = 'src/components/AssignDutyModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // 1. Rename "1 Day" back to "Today"
  code = code.replace(
    /\{label: '1 Day', val: 1\}, \{label: '2 Days', val: 2\}/,
    `{label: 'Today', val: 1}, {label: '2 Days', val: 2}`
  );

  // 2. Fix updatePresetBasedOnDates
  code = code.replace(
    /const updatePresetBasedOnDates = \(start: string, end: string\) => \{\s*if \(\!start \|\| \!end\) return;\s*const diff = Math.round\(\(new Date\(end\)\.getTime\(\) - new Date\(start\)\.getTime\(\)\) \/ \(1000 \* 3600 \* 24\)\) \+ 1;\s*if \(\[1, 2, 3, 7, 15\]\.includes\(diff\)\) \{\s*setSelectedPresetDays\(diff\);\s*\} else \{\s*setSelectedPresetDays\(null\);\s*\}\s*\};/,
    `const updatePresetBasedOnDates = (start: string, end: string) => {
    if (!start || !end) return;
    const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24)) + 1;
    const todayStr = new Date().toISOString().split('T')[0];
    if (diff === 1) {
      if (start === todayStr) {
        setSelectedPresetDays(1);
      } else {
        setSelectedPresetDays(null);
      }
    } else if ([2, 3, 7, 15].includes(diff)) {
      setSelectedPresetDays(diff);
    } else {
      setSelectedPresetDays(null);
    }
  };`
  );

  // 3. Fix onClick for preset buttons
  // Current: onClick={() => { setSelectedPresetDays(opt.val); if (fromDate) { const d = new Date(fromDate); d.setDate(d.getDate() + opt.val - 1); setToDate(d.toISOString().split('T')[0]); } }}
  code = code.replace(
    /onClick=\{\(\) => \{\s*setSelectedPresetDays\(opt\.val\);\s*if \(fromDate\) \{\s*const d = new Date\(fromDate\);\s*d\.setDate\(d\.getDate\(\) \+ opt\.val \- 1\);\s*setToDate\(d\.toISOString\(\)\.split\('T'\)\[0\]\);\s*\}\s*\}\}/,
    `onClick={() => {
                        if (opt.val === 1) {
                          const todayStr = new Date().toISOString().split('T')[0];
                          setFromDate(todayStr);
                          setToDate(todayStr);
                          setSelectedPresetDays(1);
                        } else {
                          setSelectedPresetDays(opt.val);
                          if (fromDate) {
                            const d = new Date(fromDate);
                            d.setDate(d.getDate() + opt.val - 1);
                            setToDate(d.toISOString().split('T')[0]);
                          }
                        }
                      }}`
  );

  fs.writeFileSync(file, code);
}

function fixAssignTdy() {
  let file = 'src/components/AssignTdyTab.tsx';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /\{label: '1 Day', val: 1\}, \{label: '2 Days', val: 2\}/,
    `{label: 'Today', val: 1}, {label: '2 Days', val: 2}`
  );

  code = code.replace(
    /const handlePresetToggle = \(days: number\) => \{\s*setSelectedPresetDays\(days\);\s*if \(tdyFromDate\) \{\s*const d = new Date\(tdyFromDate\);\s*d.setDate\(d.getDate\(\) \+ days - 1\);\s*setTdyToDate\(d.toISOString\(\).split\('T'\)\[0\]\);\s*\}\s*\};/,
    `const handlePresetToggle = (days: number) => {
    if (days === 1) {
      const todayStr = new Date().toISOString().split('T')[0];
      setTdyFromDate(todayStr);
      setTdyToDate(todayStr);
      setSelectedPresetDays(1);
    } else {
      setSelectedPresetDays(days);
      if (tdyFromDate) {
        const d = new Date(tdyFromDate);
        d.setDate(d.getDate() + days - 1);
        setTdyToDate(d.toISOString().split('T')[0]);
      }
    }
  };`
  );

  // Check if AssignTdyTab has updatePresetBasedOnDates logic for tdyToDate change
  // If not, just leaving the button logic is fine.

  fs.writeFileSync(file, code);
}

function fixTdyRegisterView() {
  let file = 'src/components/TdyRegisterView.tsx';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /\{label: '1 Day', val: 1\}, \{label: '2 Days', val: 2\}/,
    `{label: 'Today', val: 1}, {label: '2 Days', val: 2}`
  );

  // find preset toggle
  code = code.replace(
    /onClick=\{\(\) => handlePresetToggle\(opt\.val\)\}/g,
    `onClick={() => handlePresetToggle(opt.val)}`
  );

  code = code.replace(
    /const handlePresetToggle = \(days: number\) => \{\s*setPresetDays\(days\);\s*if \(fromDate\) \{\s*const d = new Date\(fromDate\);\s*d.setDate\(d.getDate\(\) \+ days - 1\);\s*setToDate\(d.toISOString\(\).split\('T'\)\[0\]\);\s*\}\s*\};/,
    `const handlePresetToggle = (days: number) => {
    if (days === 1) {
      const todayStr = new Date().toISOString().split('T')[0];
      setFromDate(todayStr);
      setToDate(todayStr);
      setPresetDays(1);
    } else {
      setPresetDays(days);
      if (fromDate) {
        const d = new Date(fromDate);
        d.setDate(d.getDate() + days - 1);
        setToDate(d.toISOString().split('T')[0]);
      }
    }
  };`
  );

  fs.writeFileSync(file, code);
}

fixAssignDuty();
fixAssignTdy();
fixTdyRegisterView();

console.log('Fixed Today logic and renaming');
