const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

const targetStr = `const assignments = targetDate ? localDb.getAssignmentsByDate(targetDate) : [];`;
const replaceStr = `
const assignments = targetDate ? (localDb.getRoster(targetDate.substring(0, 7)).assignments || []).filter(a => a.date === targetDate) : [];
`;

code = code.split(targetStr).join(replaceStr);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
