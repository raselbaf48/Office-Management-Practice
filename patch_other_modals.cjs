const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.startsWith('Printable') && f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10 sticky top-0"')) {
    content = content.replace(
      'className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10 sticky top-0"',
      'className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl print:hidden z-10 sticky top-0"'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched header for mobile in ${file}`);
  }
}
