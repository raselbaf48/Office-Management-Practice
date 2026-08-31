const fs = require('fs');
let file = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf-8');

// 1. Add tab state
file = file.replace(/const \[activeEditCell, setActiveEditCell\] = useState/, `const [activeTab, setActiveTab] = useState<'155 UASU BAF' | 'Flying Wing'>('155 UASU BAF');\n  const [activeEditCell, setActiveEditCell] = useState`);

// 2. Add Tabs UI just above the Official Parade Document sheet
const tabUI = `
      {/* TABS */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('155 UASU BAF')}
          className={\`px-4 py-2 rounded-lg font-bold text-sm transition-colors \${activeTab === '155 UASU BAF' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}\`}
        >
          155 UASU BAF
        </button>
        <button
          onClick={() => setActiveTab('Flying Wing')}
          className={\`px-4 py-2 rounded-lg font-bold text-sm transition-colors \${activeTab === 'Flying Wing' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}\`}
        >
          Flying Wing
        </button>
      </div>
`;
file = file.replace(/{ \/\* OFFICIAL PARADE DOCUMENT SHEET/, tabUI + '\n      {/* OFFICIAL PARADE DOCUMENT SHEET');

// 3. Conditional Wing Name in Header
file = file.replace(/155 UASU BAF \{selectedFlight !== 'Overall' \? \`\(\$\{selectedFlight\.toUpperCase\(\)\} FLIGHT\)\` : ''\}/, `{activeTab} {selectedFlight !== 'Overall' ? \`(\${selectedFlight.toUpperCase()} FLIGHT)\` : ''}`);

file = file.replace(/<td className="border-r border-black p-2 font-bold whitespace-nowrap min-w-\[120px\]">155 UASU BAF<\/td>/, `<td className="border-r border-black p-2 font-bold whitespace-nowrap min-w-[120px]">{activeTab}</td>`);

// 4. Hide disposal based on tab
file = file.replace(/{\/\* 2ND TABLE \/ BOTTOM DISPOSAL SECTION \*\//, `{activeTab === '155 UASU BAF' && (\n            <div className="bottom-disposals-wrapper">\n            {/* 2ND TABLE / BOTTOM DISPOSAL SECTION */`);
file = file.replace(/{\/\* DOCUMENT FOOTER \(PREPARED BY & AUTHORIZED BY\) \*\//, `</div>\n          )}\n\n            {/* DOCUMENT FOOTER (PREPARED BY & AUTHORIZED BY) */`);

// 5. Refresh button logo only
file = file.replace(/<RefreshCw className={\`w-4 h-4 \${loading \? 'animate-spin' : ''}\`} \/>\n\s*<span>Refresh<\/span>/, `<RefreshCw className={\`w-4 h-4 \${loading ? 'animate-spin' : ''}\`} />`);
file = file.replace(/<span>Refresh<\/span>/g, ``); // ensure it's removed

// 6. Export button border
file = file.replace(/className="flex items-center space-x-1\.5 px-3 py-2 bg-slate-900  hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"/, `className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer border border-slate-700"`);

// 7. Text-center align-middle (Wait, the user wanted vertical and horizontal alignment center for Nt Count State er Table)
file = file.replace(/<table className="w-full min-w-\[700px\] print:min-w-0 text-center border-collapse text-\[11px\] text-black table-auto">/g, `<table className="w-full min-w-[700px] print:min-w-0 text-center align-middle border-collapse text-[11px] text-black table-auto">`);
file = file.replace(/<td className="border-r border-black p-1">/g, `<td className="border-r border-black p-1 align-middle text-center">`);
file = file.replace(/<td className="border-r border-black p-1 font-bold">/g, `<td className="border-r border-black p-1 font-bold align-middle text-center">`);


fs.writeFileSync('src/components/NightCountStateView.tsx', file, 'utf-8');
console.log('Modified NightCountStateView.tsx');
