const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(") : (\\n)}", ")}");
code = code.replace(") : (\\r\\n)}", ")}");

// Or better:
code = code.replace(/\\)\\s*:\\s*\\(\\s*\\)}/g, ')}');

fs.writeFileSync('src/components/Sidebar.tsx', code);
