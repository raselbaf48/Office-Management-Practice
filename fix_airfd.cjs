const fs = require('fs');

const files = [
    'src/components/PrintableNightCountModal.tsx',
    'src/components/PrintableParadeStateModal.tsx',
    'src/components/NightCountStateView.tsx',
    'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/'Air Fd Duty'/g, "'Airfield Duty'");
    fs.writeFileSync(file, content, 'utf8');
});
console.log("Patched Air Fd to Airfield");
