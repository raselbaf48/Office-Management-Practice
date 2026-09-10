const fs = require('fs');

const files = [
    'src/components/PrintableNightCountModal.tsx',
    'src/components/PrintableParadeStateModal.tsx',
    'src/components/NightCountStateView.tsx',
    'src/components/ParadeStateFormattedView.tsx',
    'src/services/localDatabase.ts',
    'src/data/dutyTypes.ts'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'Airfield Duty'/g, "'Airfield'");
    content = content.replace(/name: 'Airfield Duty'/g, "name: 'Airfield'");
    fs.writeFileSync(file, content, 'utf8');
});
console.log("Patched Airfield Duty to Airfield");
