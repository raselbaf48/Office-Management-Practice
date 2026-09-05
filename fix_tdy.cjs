const fs = require('fs');

function fixTdy() {
  let file = 'src/components/TdyRegisterView.tsx';
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /\{currentList\.length > 0 \? \([\s\S]*?<\/div>\s*\) : \(\s*<div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium">\s*Nobody on TDY today\s*<\/div>\s*\)\}/,
    `<div className="flex-1 flex flex-col justify-end">
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
          {currentList.length}
        </span>
        <span className="text-xs font-bold text-slate-500 uppercase">Men</span>
      </div>
    </div>`
  );

  fs.writeFileSync(file, code);
}
fixTdy();
console.log('Fixed TDY Register currently on TDY box');
