const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

// Replace the hasData body to just always return true
content = content.replace(
    /const hasData = \(dutyName: string\) => {[\s\S]*?return true; \/\/ Keep others visible\s*}\s*}\);\s*};/g,
    "const hasData = (dutyName: string) => { return true; };"
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
