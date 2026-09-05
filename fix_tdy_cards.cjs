const fs = require('fs');
const file = 'src/components/TdyRegisterView.tsx';

let code = fs.readFileSync(file, 'utf8');

// 1. Add summaryFilter state
code = code.replace(
  "const [selectedYear, setSelectedYear] = useState<string>('2026');",
  "const [selectedYear, setSelectedYear] = useState<string>('2026');\n  const [summaryFilter, setSummaryFilter] = useState<'OnTdy' | 'TotalTdy' | 'Available' | null>(null);"
);

// 2. Add filtering logic to filteredAirmen
const filterAirmenRegex = /const filteredAirmen = sortedAirmen\.filter\(\(a\) => \{[\s\S]*?return true;\n  \}\);/;
const newFilterAirmen = `const filteredAirmen = sortedAirmen.filter((a) => {
    if (selectedFlight !== 'All' && a.flightName !== selectedFlight) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        a.name.toLowerCase().includes(q) ||
        a.bdNo.toLowerCase().includes(q) ||
        a.rank.toLowerCase().includes(q) ||
        a.trade.toLowerCase().includes(q);
      if (!match) return false;
    }
    
    if (summaryFilter) {
      const rec = tdyData[a.id];
      if (summaryFilter === 'OnTdy' && (!rec || !rec.currentlyOnTdy)) return false;
      if (summaryFilter === 'TotalTdy' && (!rec || rec.totalTdyDays <= 0)) return false;
      if (summaryFilter === 'Available' && (rec && rec.currentlyOnTdy)) return false;
    }
    return true;
  });`;

code = code.replace(filterAirmenRegex, newFilterAirmen);

// 3. Make cards interactive

// 3a. Currently On TDY
code = code.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px]">',
  `<div 
          onClick={() => setSummaryFilter(summaryFilter === 'OnTdy' ? null : 'OnTdy')}
          className={\`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px] cursor-pointer transition-all \${summaryFilter === 'OnTdy' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}\`}>`
);

// 3b. Total TDY Days
code = code.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">',
  `<div 
          onClick={() => setSummaryFilter(summaryFilter === 'TotalTdy' ? null : 'TotalTdy')}
          className={\`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all \${summaryFilter === 'TotalTdy' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}\`}>`
);

// 3c. Available Personnel
code = code.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">',
  `<div 
          onClick={() => setSummaryFilter(summaryFilter === 'Available' ? null : 'Available')}
          className={\`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all \${summaryFilter === 'Available' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}\`}>`
);


fs.writeFileSync(file, code);
