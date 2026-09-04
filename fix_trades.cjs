const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

// The trades might be slightly different in the db, let's make it more robust
// For Sec Asst GD: a.trade.toLowerCase().includes('sec asst')
// For Admin Asst: a.trade.toLowerCase().includes('admin asst')

code = code.replace(
  "else if (a.rank === 'Sgt' && a.trade === 'Sec Asst GD')",
  "else if (a.rank === 'Sgt' && (a.trade === 'Sec Asst GD' || (a.trade && a.trade.toLowerCase().includes('sec asst'))))"
);
code = code.replace(
  "else if (a.rank === 'Sgt' && (a.trade === 'Admin asst' || a.trade === 'Admin Asst'))",
  "else if (a.rank === 'Sgt' && (a.trade === 'Admin asst' || a.trade === 'Admin Asst' || (a.trade && a.trade.toLowerCase().includes('admin asst'))))"
);


// Replace in the second render place
code = code.replace(
  "else if (a.rank === 'Sgt' && a.trade === 'Sec Asst GD')",
  "else if (a.rank === 'Sgt' && (a.trade === 'Sec Asst GD' || (a.trade && a.trade.toLowerCase().includes('sec asst'))))"
);
code = code.replace(
  "else if (a.rank === 'Sgt' && (a.trade === 'Admin asst' || a.trade === 'Admin Asst'))",
  "else if (a.rank === 'Sgt' && (a.trade === 'Admin asst' || a.trade === 'Admin Asst' || (a.trade && a.trade.toLowerCase().includes('admin asst'))))"
);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
