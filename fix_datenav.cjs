const fs = require('fs');
let code = fs.readFileSync('src/components/DateNavigator.tsx', 'utf8');

code = code.replace(/const displayDate =.*?;\n/s, 
`  const displayDate = value && typeof value === 'string'
    ? (() => {
        const d = new Date(value);
        if(isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = String(d.getFullYear()).slice(-2);
        return \`\${day} \${month} \${year}\`;
      })()
    : '';\n`);

fs.writeFileSync('src/components/DateNavigator.tsx', code);
