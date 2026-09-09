const fs = require('fs');
let content = fs.readFileSync('src/components/RandomizedKeypad.tsx', 'utf8');

// Replace the bottom row of the grid.
const newBottomRow = `
        {/* Delete Button (Left side) */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); handleDelete(); }}
          className="h-12 sm:h-14 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 active:bg-red-200 dark:active:bg-red-900/60 rounded-xl text-red-600 dark:text-red-400 transition-colors shadow-sm cursor-pointer flex items-center justify-center font-bold"
        >
          <Delete className="w-6 h-6" />
        </button>
        
        {/* 10th Number (Center) */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); handleKeyPress(keys[9]); }}
          className="h-12 sm:h-14 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 rounded-xl text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
        >
          {keys[9]}
        </button>
        
        {/* Submit/Done Button (Right side) */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); if(onSubmit) onSubmit(); }}
          className="h-12 sm:h-14 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 border border-emerald-600 rounded-xl text-white font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center text-sm"
        >
          Done
        </button>
`;

content = content.replace(
  /\{\/\* Empty Space \*\/\}[\s\S]*?\<\/button\>/,
  newBottomRow.trim()
);

fs.writeFileSync('src/components/RandomizedKeypad.tsx', content, 'utf8');
