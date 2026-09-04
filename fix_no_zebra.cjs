const fs = require('fs');
const files = [
    'src/components/PrintableParadeStateModal.tsx',
    'src/components/PrintableNightCountModal.tsx',
    'src/components/PrintableFlyingWingModal.tsx',
    'src/components/ParadeStateFormattedView.tsx'
];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/no-zebra no-zebra/g, 'no-zebra');
    content = content.replace(/no-zebra no-zebra/g, 'no-zebra');
    fs.writeFileSync(f, content);
});
console.log("Fixed duplicate no-zebra");
