const fs = require('fs');

let file = 'src/components/AirmanProfileModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const isGroupedView = categoryFilter === 'LEAVE' \|\| categoryFilter === 'TDY' \|\| categoryFilter === 'ATT';\s*const groupedList = isGroupedView \? getGroupedList\(filteredList\) : \[\];\s*const filteredList = assignments\.filter\(\(a\) => \{[\s\S]*?return true;\s*\}\);/,
  `const filteredList = assignments.filter((a) => {
    if (categoryFilter === 'DUTY') return !['LEAVE', 'TDY', 'ATT', 'DUTY_OFF', 'ON_PARADE'].includes(a.dutyCode);
    if (categoryFilter === 'ATT') return a.dutyCode === 'ATT' || a.dutyCode === 'BAKE_N_BITE';
    if (categoryFilter === 'LEAVE') return a.dutyCode === 'LEAVE';
    if (categoryFilter === 'TDY') return a.dutyCode === 'TDY';
    return true;
  });

  const isGroupedView = categoryFilter === 'LEAVE' || categoryFilter === 'TDY' || categoryFilter === 'ATT';
  const groupedList = isGroupedView ? getGroupedList(filteredList) : [];`
);

fs.writeFileSync(file, code);
