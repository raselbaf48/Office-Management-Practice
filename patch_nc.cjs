const fs = require('fs');

const file = 'src/components/PrintableNightCountModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const startRegex = /<label\s*key=\{a\.id\}[\s\S]*?<\/label>/g;

content = content.replace(startRegex, (fullMatch) => {
  if (!fullMatch.includes('type="checkbox"')) return fullMatch;
  
  let replaced = fullMatch.replace('<label', '<div onClick={() => { if (isChecked) { setSelectedDisposalAirmenIds((prev) => prev.filter((id) => id !== a.id)); } else { setSelectedDisposalAirmenIds((prev) => [...prev, a.id]); } }}');
  
  replaced = replaced.replace(/<input[\s\S]*?className="[^"]+"[\s\S]*?\/>/, `<div className={\`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors \${isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 border'}\`}>
                          {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                        </div>`);

  replaced = replaced.replace(/<\/label>/g, '</div>');
  return replaced;
});

// Remove role check for settings icon
content = content.replace(/&& sessionStorage\.getItem\('baf_user_role'\) === 'SUPER_ADMIN'\s*/g, '');

fs.writeFileSync(file, content);
console.log(`Patched ${file}`);

