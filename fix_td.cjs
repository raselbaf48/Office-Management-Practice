const fs = require('fs');

const files = [
  'src/components/LeaveRegisterView.tsx',
  'src/components/TdyRegisterView.tsx',
  'src/components/DeploymentRegisterView.tsx'
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  
  // Find the exact block
  const tdRegex = /<td className="py-3 px-4 text-right">\s*<button[\s\S]*?<Eye className="w-3 h-3 text-slate-500" \/>\s*<span>History<\/span>\s*<\/button>\s*<\/td>/g;
  
  code = code.replace(tdRegex, '');
  fs.writeFileSync(f, code);
});
