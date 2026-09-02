const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

code = code.replace(/<div className="flex flex-wrap items-center justify-end gap-2.5 mb-4 print:hidden">/, 
`<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg shrink-0">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">State Controls</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Select date range and flight</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center xl:justify-end gap-2.5">`);

code = code.replace(/\{isInternalPrintOpen \? \(\n\s*<button/, `</div>\n        {isInternalPrintOpen ? (\n          <button`);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
