const fs = require('fs');
let code;
const globFiles = [
    'src/utils/dutyFormatter.ts',
    'src/components/ParadeStateFormattedView.tsx',
    'src/components/AssignDutyModal.tsx',
    'src/components/PrintableParadeStateModal.tsx',
    'src/data/officialJulyAugustData.ts',
    'src/services/localDatabase.ts'
];

globFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    code = fs.readFileSync(file, 'utf8');
    
    // Simple global replace
    code = code.replace(/'AIRFIELD_DUTY'/g, "'ATT'");
    code = code.replace(/"AIRFIELD_DUTY"/g, '"ATT"');
    
    // Revert the messed up replacing from fix_lint3.cjs
    code = code.replace(/\(a\.dutyCode === 'ATT' \|\| a\.dutyCode === 'DETT'\)/g, "a.dutyCode === 'ATT'");
    code = code.replace(/\(d\.dutyCode === 'ATT' \|\| d\.dutyCode === 'DETT'\)/g, "d.dutyCode === 'ATT'");

    fs.writeFileSync(file, code);
});
