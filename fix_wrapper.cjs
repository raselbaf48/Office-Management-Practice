const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf-8');

code = code.replace(
  '  return (\n       \n    <div className="w-full max-w-7xl mx-auto pb-12 animate-fadeIn space-y-6">',
  '  return (\n    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">\n      <div className="flex-none pt-4 px-4 md:pt-6 md:px-6 w-full max-w-7xl mx-auto animate-fadeIn space-y-6">'
);
if (code.includes('flex-none pt-4 px-4')) {
  console.log("Success already?");
} else {
  // try regex
  code = code.replace(/return \([\s\S]*?<div className="w-full max-w-7xl mx-auto pb-12 animate-fadeIn space-y-6">/, 'return (\n    <div className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">\n      <div className="flex-none pt-4 px-4 md:pt-6 md:px-6 w-full max-w-7xl mx-auto animate-fadeIn space-y-6">');
  fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
}
