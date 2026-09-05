const fs = require('fs');

// Fix LeaveRegisterView
let file1 = 'src/components/LeaveRegisterView.tsx';
let code1 = fs.readFileSync(file1, 'utf8');
code1 = code1.replace(
  /recreationLeaveDays: 0,/,
  `recreationLeaveDays: 0,\n                    sickLeaveDays: 0,`
);
code1 = code1.replace(
  /recreationLeaveDays: 0,\s*totalLeaveDays: 0,/,
  `recreationLeaveDays: 0,\n                    sickLeaveDays: 0,\n                    totalLeaveDays: 0,`
);
fs.writeFileSync(file1, code1);

// Fix AirmanProfileModal
let file2 = 'src/components/AirmanProfileModal.tsx';
let code2 = fs.readFileSync(file2, 'utf8');
code2 = code2.replace(
  /const diffTime = Math\.abs\(currDate - prevDate\);/,
  `const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());`
);
fs.writeFileSync(file2, code2);
