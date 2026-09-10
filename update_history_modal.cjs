const fs = require('fs');
const file = 'src/components/EntryHistoryModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const filterTypeFind = `filterType?: 'LEAVE' | 'TDY' | 'DUTY' | 'ALL';`;
const filterTypeReplace = `filterType?: 'LEAVE' | 'TDY' | 'DEPLOYMENT' | 'DUTY' | 'SYSTEM' | 'ALL';`;
content = content.replace(filterTypeFind, filterTypeReplace);

const filterLogicFind = `    if (filterType === 'LEAVE' && item.dutyCode !== 'LEAVE') return false;
    if (filterType === 'TDY' && item.dutyCode !== 'TDY') return false;
    if (filterType === 'DUTY' && (item.dutyCode === 'LEAVE' || item.dutyCode === 'TDY')) return false;`;
const filterLogicReplace = `    if (filterType === 'LEAVE' && item.dutyCode !== 'LEAVE') return false;
    if (filterType === 'TDY' && item.dutyCode !== 'TDY') return false;
    if (filterType === 'DEPLOYMENT' && item.dutyCode !== 'DEPLOYMENT') return false;
    if (filterType === 'DUTY' && (item.dutyCode === 'LEAVE' || item.dutyCode === 'TDY' || item.dutyCode === 'DEPLOYMENT' || !item.dutyCode)) return false;
    if (filterType === 'SYSTEM' && item.actionType !== 'SYSTEM_ACTION') return false;`;
content = content.replace(filterLogicFind, filterLogicReplace);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched EntryHistoryModal filters!");
