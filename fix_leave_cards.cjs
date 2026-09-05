const fs = require('fs');
const file = 'src/components/LeaveRegisterView.tsx';

let code = fs.readFileSync(file, 'utf8');

const replacementFn = (match, p1, p2, p3, p4, filterName) => {
    return `<div 
          onClick={() => setSummaryFilter(summaryFilter === '${filterName}' ? null : '${filterName}')}
          className={\`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs cursor-pointer transition-all \${summaryFilter === '${filterName}' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}\`}>`;
}

// 1. Casual
let start = code.indexOf('<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">');
let end = code.indexOf('</div>', start + 200) + 6;
let block = code.substring(start, end);
code = code.replace(block, block.replace(/<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">/, replacementFn('', '', '', '', 'Casual')));

// 2. Annual
start = code.indexOf('<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">', start + 1);
end = code.indexOf('</div>', start + 200) + 6;
block = code.substring(start, end);
code = code.replace(block, block.replace(/<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">/, replacementFn('', '', '', '', 'Annual')));

// 3. Recreation
start = code.indexOf('<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">', start + 1);
end = code.indexOf('</div>', start + 200) + 6;
block = code.substring(start, end);
code = code.replace(block, block.replace(/<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">/, replacementFn('', '', '', '', 'Recreation')));

// 4. Net Leave Consumed
start = code.indexOf('<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">', start + 1);
end = code.indexOf('</div>', start + 200) + 6;
block = code.substring(start, end);
block = block.replace('Net Leave Consumed', 'Total Leave');
code = code.replace(code.substring(start, end), block.replace(/<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">/, replacementFn('', '', '', '', 'Total')));

// 5. Currently On Leave
code = code.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px]">',
  `<div 
          onClick={() => setSummaryFilter(summaryFilter === 'OnLeave' ? null : 'OnLeave')}
          className={\`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px] cursor-pointer transition-all \${summaryFilter === 'OnLeave' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}\`}>`
);


fs.writeFileSync(file, code);
