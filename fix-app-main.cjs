const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /\<main className=\{\`flex\-1 px\-4 sm:px\-6 lg:px\-8 py\-6 max\-w\-\[1600px\] w\-full mx\-auto print:p\-0 print:m\-0 print:max\-w\-none print:w\-full \$\{isPrintModalOpen \? 'print:hidden' : ''\}\`\}\>/g,
  '<main className={`flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full`}>'
);

fs.writeFileSync('src/App.tsx', content);
