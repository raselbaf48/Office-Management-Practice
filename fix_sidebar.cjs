const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(/'bg-white text-emerald-950 shadow-md scale-\[1.01\]'/g, `'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-900/50 scale-[1.02] border border-emerald-400/30'`);

code = code.replace(/'text-emerald-800'/g, `'text-white'`);

// Ensure mobile options have a bit more padding and look like separated boxes.
// Find the outer div of options which is currently "mt-1 space-y-1" and replace it with "mt-1 space-y-1.5 sm:space-y-1"
code = code.replace(/className="mt-1 space-y-1"/g, `className="mt-2 space-y-2 sm:space-y-1"`);

// Find the <button> className and adjust padding
code = code.replace(/'justify-start px-3 py-2.5'/g, `'justify-start px-3 py-3 sm:py-2.5'`);

fs.writeFileSync('src/components/Sidebar.tsx', code);
