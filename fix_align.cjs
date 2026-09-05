const fs = require('fs');

let file = 'src/components/DutyRatioMatrixView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  'className="flex flex-col items-center justify-center mt-6 w-full max-w-3xl"',
  'className="flex flex-col items-center justify-center mt-6 w-full max-w-3xl mx-auto"'
);

code = code.replace(
  'className="flex flex-wrap space-x-1 sm:space-x-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl w-full max-w-3xl mt-4"',
  'className="flex flex-wrap space-x-1 sm:space-x-2 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl w-full max-w-3xl mt-4 mx-auto justify-center"'
);

fs.writeFileSync(file, code);
console.log('Fixed alignment');
