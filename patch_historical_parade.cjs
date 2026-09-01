const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // Let's make sure we also add historical OTHERS options for parade views
  if (!code.includes('historicalCustomCats')) {
    code = code.replace(
      'const [isEditingDisposals, setIsEditingDisposals] = useState(false);',
      `const [isEditingDisposals, setIsEditingDisposals] = useState(false);\n  const [historicalCustomCats, setHistoricalCustomCats] = useState<{code: string, label: string, customTitle: string}[]>(() => { try { const saved = localStorage.getItem('parade_historical_custom'); return saved ? JSON.parse(saved) : []; } catch { return []; } });`
    );
    
    code = code.replace(
      "const isAlreadyAdded = savedDisposals.some(d => d.code === opt.code && (d.code !== 'OTHERS' || d.customTitle === opt.customTitle));",
      `const isAlreadyAdded = savedDisposals.some(d => d.code === opt.code && (d.code !== 'OTHERS' || d.customTitle === opt.customTitle));
    
    if (opt.code === 'OTHERS' && opt.customTitle && !historicalCustomCats.some(h => h.customTitle === opt.customTitle)) {
      const newHistory = [...historicalCustomCats, opt];
      setHistoricalCustomCats(newHistory);
      localStorage.setItem('parade_historical_custom', JSON.stringify(newHistory));
    }`
    );
    
    // update the dropdown
    code = code.replace(
      "ALL_DISPOSAL_OPTIONS.filter(opt => opt.code === 'OTHERS' || !savedDisposals.some(d => d.code === opt.code)).map((opt) => (",
      "[...ALL_DISPOSAL_OPTIONS, ...historicalCustomCats].filter(opt => opt.code === 'OTHERS' || (!savedDisposals.some(d => d.code === opt.code && (d.code !== 'OTHERS' || d.customTitle === opt.customTitle)))).filter((opt, index, self) => index === self.findIndex((t) => t.code === opt.code && t.customTitle === opt.customTitle)).map((opt) => ("
    );
    
    // Replace the button display to show custom title if exists
    // <button ... > {opt.label} </button> => {opt.code === 'OTHERS' && opt.customTitle ? opt.customTitle : opt.label}
    // We will do this via a regex
    code = code.replace(
      /className="w-full text-left px-4 py-2 text-\[11px\] font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900\/30 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors"\s*>\s*\{opt\.label\}\s*<\/button>/g,
      `className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors"\n                            >\n                              {opt.code === 'OTHERS' && opt.customTitle ? opt.customTitle : opt.label}\n                            </button>`
    );
    
    fs.writeFileSync(file, code);
  }
});
