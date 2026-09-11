const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // We find the block to replace.
  const regex = /<label(\s*key=\{a\.id\}\s*className=\{`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none text-xs \$\{)[\s\S]*?(<div className="flex items-center space-x-2\.5 min-w-0">)\s*<input\s+type="checkbox"\s+checked=\{isChecked\}\s+onChange=\{[^}]*\}\s*\}\s*\}\s*className="[^"]+"\s*\/>/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const fullMatch = match[0];
    
    let replaced = fullMatch.replace('<label', '<div onClick={() => { if (isChecked) { setSelectedDisposalAirmenIds((prev) => prev.filter((id) => id !== a.id)); } else { setSelectedDisposalAirmenIds((prev) => [...prev, a.id]); } }}');
    replaced = replaced.replace(/<input\s+type="checkbox"[\s\S]*?\/>/, `<div className={\`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors \${isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 border'}\`}>
                            {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                          </div>`);

    content = content.replace(fullMatch, replaced);
  }

  // Also replace the closing </label> that matches this block.
  // Because it's within the map function, we can replace </label> that comes shortly after with </div>
  content = content.replace(/<\/span>\s*<\/label>/g, '</span>\n                      </div>');

  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
