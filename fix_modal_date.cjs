const fs = require('fs');
let file = fs.readFileSync('src/components/PrintableFlyingWingModal.tsx', 'utf-8');

file = file.replace(/document\.title = \`Consolidated Night Count State - Flg Wg \\\(\\\$\{date\}\\\)\`;/, `
    const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, ' ');
    document.title = \`Consolidated Night Count State - Flg Wg (\${formattedDate})\`;
`);

fs.writeFileSync('src/components/PrintableFlyingWingModal.tsx', file, 'utf-8');
