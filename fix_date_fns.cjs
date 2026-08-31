const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

file = file.replace(/import \{ format, parseISO \} from 'date-fns';\n/, '');

file = file.replace(/const formatDateShort = \(dateStr: string\) => \{\n    if \(!dateStr\) return '';\n    try \{\n      return format\(parseISO\(dateStr\), 'dd MMM yy'\);\n    \} catch \(e\) \{\n      return dateStr;\n    \}\n  \};/, `const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear().toString().slice(-2);
      return \`\${day} \${month} \${year}\`;
    } catch (e) {
      return dateStr;
    }
  };`);

fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
