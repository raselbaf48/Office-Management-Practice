const fs = require('fs');
const file = 'src/components/LeaveRegisterView.tsx';

let code = fs.readFileSync(file, 'utf8');

// 1. Add summaryFilter state
code = code.replace(
  "const [selectedYear, setSelectedYear] = useState<string>('2026');",
  "const [selectedYear, setSelectedYear] = useState<string>('2026');\n  const [summaryFilter, setSummaryFilter] = useState<'Casual' | 'Annual' | 'Recreation' | 'Total' | 'OnLeave' | null>(null);"
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
      const rec = leaveData[a.id];
      if (!rec) return false;
      if (summaryFilter === 'Casual' && rec.casualLeaveDays <= 0) return false;
      if (summaryFilter === 'Annual' && rec.annualLeaveDays <= 0) return false;
      if (summaryFilter === 'Recreation' && rec.recreationLeaveDays <= 0) return false;
      if (summaryFilter === 'Total' && rec.totalLeaveDays <= 0) return false;
      if (summaryFilter === 'OnLeave' && !rec.currentlyOnLeave) return false;
    }
    return true;
  });`;

code = code.replace(filterAirmenRegex, newFilterAirmen);

// 3. Make cards interactive
const casualRegex = /<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">/g;

// Casual
code = code.replace(
  /<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">/g,
  (match, offset, str) => {
     // I need to be careful with replace global.
     return match;
  }
);
fs.writeFileSync(file, code);
