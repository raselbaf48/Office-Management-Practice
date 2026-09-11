const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace <label> with <div onClick="...">
  const targetRegex = /<label\s+key=\{a\.id\}\s+className=\{`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none text-xs \$\{\s+isChecked\s+\?\s+'[^']+'\s+:\s+'[^']+'\s+\}`\}\s*>\s*<div className="flex items-center space-x-2\.5 min-w-0">\s*<input\s+type="checkbox"\s+checked=\{isChecked\}\s+onChange=\{\(\) => \{\s*if \(isChecked\) \{\s*setSelectedDisposalAirmenIds\(\(prev\) => prev\.filter\(\(id\) => id !== a\.id\)\);\s*\} else \{\s*setSelectedDisposalAirmenIds\(\(prev\) => \[\.\.\.prev, a\.id\]\);\s*\}\s*\}\}\s+className="[^"]+"\s*\/>/gm;

  content = content.replace(targetRegex, (match) => {
    // extract the className strings
    const classMatch = match.match(/isChecked\s*\?\s*'([^']+)'\s*:\s*'([^']+)'/);
    const checkedClass = classMatch ? classMatch[1] : 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 dark:border-purple-600 text-purple-950 dark:text-purple-300 font-bold shadow-sm';
    const uncheckedClass = classMatch ? classMatch[2] : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-slate-800 dark:text-slate-200 font-medium';

    return `<div
                        key={a.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedDisposalAirmenIds((prev) => prev.filter((id) => id !== a.id));
                          } else {
                            setSelectedDisposalAirmenIds((prev) => [...prev, a.id]);
                          }
                        }}
                        className={\`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none text-xs \${
                          isChecked
                            ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 dark:border-purple-600 text-purple-950 dark:text-purple-300 font-bold shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 text-slate-800 dark:text-slate-200 font-medium'
                        }\`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={\`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors \${isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 border'}\`}>
                            {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                          </div>`;
  });

  // Replace closing </label> for this section with </div>
  // Wait, there might be other </label> tags. Let's just find the exact block and replace it string by string if possible, or use a more precise regex.
}
