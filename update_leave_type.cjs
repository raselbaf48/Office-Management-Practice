const fs = require('fs');

let file = 'src/components/LeaveRegisterView.tsx';
let code = fs.readFileSync(file, 'utf8');

// Update LeaveRecord interface
code = code.replace(
  /recreationLeaveDays: number;\s*totalLeaveDays: number;/,
  `recreationLeaveDays: number;
  sickLeaveDays: number;
  totalLeaveDays: number;`
);

code = code.replace(
  /currentLeaveType\?: 'Casual Leave' \| 'Annual Leave' \| 'Recreation Leave' \| 'Leave';/g,
  `currentLeaveType?: 'Casual Leave' | 'Annual Leave' | 'Recreation Leave' | 'Sick Leave' | 'Leave';`
);

code = code.replace(
  /type: 'Casual Leave' \| 'Annual Leave' \| 'Recreation Leave' \| 'Leave';/g,
  `type: 'Casual Leave' | 'Annual Leave' | 'Recreation Leave' | 'Sick Leave' | 'Leave';`
);

// State update
code = code.replace(
  /const \[leaveType, setLeaveType\] = useState<'Casual' \| 'Annual' \| 'Recreation'>\('Casual'\);/,
  `const [leaveType, setLeaveType] = useState<'Casual' | 'Annual' | 'Recreation' | 'Sick' | ''>('');`
);

// Effect update
code = code.replace(
  /\/\/ Auto-select Leave Type based on duration[\s\S]*?\}, \[leaveDurationDays\]\);/,
  `// Auto-select Leave Type based on duration
  useEffect(() => {
    if (leaveDurationDays <= 10) {
      setLeaveType('Casual');
    } else if (leaveDurationDays > 10) {
      setLeaveType('Annual');
    }
  }, [leaveDurationDays]);`
);

// date change auto fix
code = code.replace(
  /if \(baseDays > 10 && leaveType === 'Casual'\) \{\s*setLeaveType\('Annual'\);\s*\}/,
  `if (baseDays > 10 && leaveType === 'Casual') {
        setLeaveType('Annual');
      }`
);

// form submission fullTypeName
code = code.replace(
  /const fullTypeName = leaveType === 'Casual' \? 'Casual Leave' : leaveType === 'Annual' \? 'Annual Leave' : 'Recreation Leave';/,
  `const fullTypeName = leaveType === 'Casual' ? 'Casual Leave' : leaveType === 'Annual' ? 'Annual Leave' : leaveType === 'Sick' ? 'Sick Leave' : leaveType === 'Recreation' ? 'Recreation Leave' : 'Leave';`
);

// UI Update
// The UI part is a bit complex, let's extract the exact block from code first to replace it perfectly.
fs.writeFileSync(file, code);
