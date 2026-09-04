const fs = require('fs');

let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf-8');

// Update DateMode in handleSetPreset
content = content.replace(
`    if (type === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
      setSelectedDate(todayStr);
    } else if (type === '7days') {`,
`    if (type === 'today') {
      setDateMode('single');
      setFromDate(todayStr);
      setToDate(todayStr);
      setSelectedDate(todayStr);
    } else if (type === '7days') {
      setDateMode('multi');`
);

content = content.replace(
`    } else if (type === '15days') {`,
`    } else if (type === '15days') {
      setDateMode('multi');`
);

content = content.replace(
`    } else if (type === 'month') {`,
`    } else if (type === 'month') {
      setDateMode('multi');`
);

// Remove the Date Mode Toggle buttons
const toggleBlock = `<div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => {
                setDateMode('single');
                setToDate(fromDate);
                setActivePreset('today');
              }}
              className={\`px-3 py-1.5 rounded-lg transition-all \${dateMode === 'single' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}\`}
            >
              Single Dt
            </button>
            <button
              onClick={() => setDateMode('multi')}
              className={\`px-3 py-1.5 rounded-lg transition-all \${dateMode === 'multi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}\`}
            >
              Multi Dt
            </button>
          </div>`;

content = content.replace(toggleBlock, '');

// Also need to automatically switch to multi if user selects a To date
content = content.replace(
`onChange={(e) => {
                  setToDate(e.target.value);
                  setActivePreset('custom');
                }}`,
`onChange={(e) => {
                  setToDate(e.target.value);
                  setActivePreset('custom');
                  setDateMode('multi');
                }}`
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
console.log("Patched ParadeStateFormattedView.tsx");
