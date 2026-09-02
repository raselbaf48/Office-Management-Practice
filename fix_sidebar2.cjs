const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
code = code.replace(/'text-emerald-100 hover:bg-\[\#0b4a2d\] hover:text-white'/g, `'bg-[#084228]/50 text-emerald-100 hover:bg-[#0b4a2d] hover:text-white border border-[#0d5635]/50'`);
fs.writeFileSync('src/components/Sidebar.tsx', code);
