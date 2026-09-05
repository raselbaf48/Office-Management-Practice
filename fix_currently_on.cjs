const fs = require('fs');

function fixCurrentlyOn(file, spanRegex) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Replace the specific span containing the duplicate number
  code = code.replace(spanRegex, '');

  fs.writeFileSync(file, code);
}

fixCurrentlyOn('src/components/LeaveRegisterView.tsx', /<span className="bg-purple-100 text-purple-700 px-2 py-0\.5 rounded-full text-\[10px\]">\{currentList\.length\}<\/span>/);
fixCurrentlyOn('src/components/TdyRegisterView.tsx', /<span className="bg-emerald-100 text-emerald-700 px-2 py-0\.5 rounded-full text-\[10px\]">\{currentList\.length\}<\/span>/);
fixCurrentlyOn('src/components/DeploymentRegisterView.tsx', /<span className="bg-emerald-100 text-emerald-700 px-2 py-0\.5 rounded-full text-\[10px\]">\{currentList\.length\}<\/span>/);

console.log('Fixed duplicate currently on numbers');
