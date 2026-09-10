const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace Header (PrintableParadeStateModal)
  content = content.replace(
    /<th className="border border-slate-800 dark:border-slate-700 p-0\.5 align-middle text-center">\s*<div className="w-full h-28 flex items-center justify-center \[writing-mode:vertical-lr\] \[transform:rotate\(180deg\)\] text-\[9px\]">Canteen<\/div>\s*<\/th>/g,
    '{!isPtDocument && (<th className="border border-slate-800 dark:border-slate-700 p-0.5 align-middle text-center"><div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Canteen</div></th>)}'
  );

  // Replace Header (ParadeStateFormattedView)
  content = content.replace(
    /<th className="border border-slate-800 dark:border-white print:border-black p-0\.5 align-middle text-center">\s*<div className="w-full h-28 flex items-center justify-center \[writing-mode:vertical-lr\] \[transform:rotate\(180deg\)\] text-\[9px\]">Canteen<\/div>\s*<\/th>/g,
    '{!isPtDocument && (<th className="border border-slate-800 dark:border-white print:border-black p-0.5 align-middle text-center"><div className="w-full h-28 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[9px]">Canteen</div></th>)}'
  );

  // Replace Cell (PrintableParadeStateModal)
  content = content.replace(
    /<td className="border border-slate-800 dark:border-slate-700 p-1 text-center align-middle">\{stats\.canteenCount > 0 \? stats\.canteenCount : '-'}<\/td>/g,
    '{!isPtDocument && (<td className="border border-slate-800 dark:border-slate-700 p-1 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : "-"}</td>)}'
  );

  // Replace Cell (ParadeStateFormattedView)
  content = content.replace(
    /<td className="border border-slate-800 dark:border-white print:border-black p-1 text-center align-middle">\{stats\.canteenCount > 0 \? stats\.canteenCount : '-'}<\/td>/g,
    '{!isPtDocument && (<td className="border border-slate-800 dark:border-white print:border-black p-1 text-center align-middle">{stats.canteenCount > 0 ? stats.canteenCount : "-"}</td>)}'
  );

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Patched Canteen column visibility again");
