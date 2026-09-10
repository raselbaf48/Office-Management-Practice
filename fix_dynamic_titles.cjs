const fs = require('fs');
const file = 'src/components/DashboardParadeState.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetFind = `<span className={\`text-[11px] font-bold \${theme.text} font-bold tracking-wider uppercase line-clamp-1\`}>`;
const targetReplace = `<span className={\`text-[11px] font-bold \${theme.text} font-bold tracking-wider\`}>`;

content = content.replace(targetFind, targetReplace);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched dynamic titles styling");
