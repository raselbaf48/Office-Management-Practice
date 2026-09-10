const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Hide the Canteen column header in PT state
  const headerSearch = `<th className="border border-slate-800 dark:border-slate-700 p-0.5 align-middle text-center">\n  <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Canteen</div>\n</th>`;
  
  // Try finding it with print:border-black for FormattedView
  const headerSearchFormatted = `<th className="border border-slate-800 dark:border-white print:border-black p-0.5 align-middle text-center">\n  <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Canteen</div>\n</th>`;

  content = content.replace(headerSearch, `{!isPtDocument && (\n<th className="border border-slate-800 dark:border-slate-700 p-0.5 align-middle text-center">\n  <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Canteen</div>\n</th>\n)}`);
  
  content = content.replace(headerSearchFormatted, `{!isPtDocument && (\n<th className="border border-slate-800 dark:border-white print:border-black p-0.5 align-middle text-center">\n  <div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Canteen</div>\n</th>\n)}`);


  // Hide the Canteen cell in PT state
  const cellSearch = `<td className="border border-slate-800 dark:border-slate-700 p-1 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : '-'}</td>`;
  const cellSearchFormatted = `<td className="border border-slate-800 dark:border-white print:border-black p-1 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : '-'}</td>`;

  content = content.replace(cellSearch, `{!isPtDocument && (\n<td className="border border-slate-800 dark:border-slate-700 p-1 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : '-'}</td>\n)}`);
  content = content.replace(cellSearchFormatted, `{!isPtDocument && (\n<td className="border border-slate-800 dark:border-white print:border-black p-1 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : '-'}</td>\n)}`);

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Patched Canteen column visibility");
