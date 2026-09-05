const fs = require('fs');
const file = 'src/components/DeploymentRegisterView.tsx';

let code = fs.readFileSync(file, 'utf8');

// 1. Add summaryFilter state
code = code.replace(
  "const [selectedYear, setSelectedYear] = useState<string>('2026');",
  "const [selectedYear, setSelectedYear] = useState<string>('2026');\n  const [summaryFilter, setSummaryFilter] = useState<'OnAtt' | 'TotalAtt' | 'Available' | null>(null);"
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
      const rec = attData[a.id];
      if (summaryFilter === 'OnAtt' && (!rec || !rec.currentlyOnAtt)) return false;
      if (summaryFilter === 'TotalAtt' && (!rec || rec.totalAttDays <= 0)) return false;
      if (summaryFilter === 'Available' && (rec && rec.currentlyOnAtt)) return false;
    }
    return true;
  });`;

code = code.replace(filterAirmenRegex, newFilterAirmen);

// 3. Make cards interactive

// 3a. Currently On Deployment
code = code.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px]">',
  `<div 
          onClick={() => setSummaryFilter(summaryFilter === 'OnAtt' ? null : 'OnAtt')}
          className={\`bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs flex flex-col h-full max-h-[140px] cursor-pointer transition-all \${summaryFilter === 'OnAtt' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}\`}>`
);

// 3b. Total Deployment Days
code = code.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">',
  `<div 
          onClick={() => setSummaryFilter(summaryFilter === 'TotalAtt' ? null : 'TotalAtt')}
          className={\`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all \${summaryFilter === 'TotalAtt' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}\`}>`
);

// 3c. Available Personnel
code = code.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">',
  `<div 
          onClick={() => setSummaryFilter(summaryFilter === 'Available' ? null : 'Available')}
          className={\`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all \${summaryFilter === 'Available' ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'}\`}>`
);


fs.writeFileSync(file, code);
