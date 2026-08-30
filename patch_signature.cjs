const fs = require('fs');

// Patch SignatureConfigModal.tsx
let file = 'src/components/SignatureConfigModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update Defaults
content = content.replace(
  "name: 'MD NAHID HASAN KHAN',\n  rank: 'SGT',\n  designation: 'Admin SNCO',\n  unit: '155 UASU BAF'",
  "name: 'MD NAHID HASAN KHAN',\n  rank: 'SGT',\n  designation: 'UWO',\n  unit: '155 UASU BAF'"
);

content = content.replace(
  "name: 'MD SHAHINUZZAMAN',\n  rank: 'WO',\n  designation: 'WOIC Orderly Room',\n  unit: '155 UASU BAF'",
  "name: 'MAHIM RAAD SADAT',\n  rank: 'FLT LT',\n  designation: 'Adjutant',\n  unit: '155 UASU BAF'"
);

// Update Preview
content = content.replace(
  `<div className="text-xs font-black uppercase text-slate-900 dark:text-white">
                  {prepared.name || 'NAME'}
                </div>
                <div className="text-[11px] font-bold uppercase">{prepared.rank || 'RANK'}</div>
                <div className="text-[10px] font-normal">{prepared.designation || 'Designation'}</div>
                <div className="text-[9px] text-slate-500">{prepared.unit || '155 UASU BAF'}</div>`,
  `<div className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white uppercase">
                  {prepared.name || 'NAME'}, {prepared.rank || 'RANK'}, {prepared.designation || 'Designation'}, {prepared.unit || '155 UASU BAF'}
                </div>`
);

content = content.replace(
  `<div className="text-xs font-black uppercase text-slate-900 dark:text-white">
                  {authorized.name || 'NAME'}
                </div>
                <div className="text-[11px] font-bold uppercase">{authorized.rank || 'RANK'}</div>
                <div className="text-[10px] font-normal">{authorized.designation || 'Designation'}</div>
                <div className="text-[9px] text-slate-500">{authorized.unit || '155 UASU BAF'}</div>`,
  `<div className="text-[9px] sm:text-[10px] font-bold text-slate-900 dark:text-white uppercase">
                  {authorized.name || 'NAME'}, {authorized.rank || 'RANK'}, {authorized.designation || 'Designation'}, {authorized.unit || '155 UASU BAF'}
                </div>`
);

fs.writeFileSync(file, content);

// Patch PrintableParadeStateModal.tsx
file = 'src/components/PrintableParadeStateModal.tsx';
content = fs.readFileSync(file, 'utf8');

// Also update defaults here
content = content.replace(
  "useState(initialPrep.designation || 'Admin SNCO');",
  "useState(initialPrep.designation || 'UWO');"
);

content = content.replace(
  "useState(initialAuth.name || 'MD SHAHINUZZAMAN');",
  "useState(initialAuth.name || 'MAHIM RAAD SADAT');"
);
content = content.replace(
  "useState(initialAuth.rank || 'WO');",
  "useState(initialAuth.rank || 'FLT LT');"
);
content = content.replace(
  "useState(initialAuth.designation || 'WOIC Orderly Room');",
  "useState(initialAuth.designation || 'Adjutant');"
);

content = content.replace(
  /<p className="font-bold text-black uppercase tracking-wide">\s*\{leftSigName\}\s*<\/p>\s*<p className="font-bold text-black uppercase">\{leftSigRank\}<\/p>\s*<p className="font-normal text-black">\{leftSigDesig\}<\/p>\s*<p className="font-normal text-black">155 UASU BAF<\/p>/g,
  `<p className="font-bold text-black uppercase text-[10px] tracking-wide">
                              {leftSigName}, {leftSigRank}, {leftSigDesig}, 155 UASU BAF
                            </p>`
);

content = content.replace(
  /<p className="font-bold text-black uppercase tracking-wide">\s*\{rightSigName\}\s*<\/p>\s*<p className="font-bold text-black uppercase">\{rightSigRank\}<\/p>\s*<p className="font-normal text-black">\{rightSigDesig\}<\/p>\s*<p className="font-normal text-black">155 UASU BAF<\/p>/g,
  `<p className="font-bold text-black uppercase text-[10px] tracking-wide">
                              {rightSigName}, {rightSigRank}, {rightSigDesig}, 155 UASU BAF
                            </p>`
);

fs.writeFileSync(file, content);

// Update DocxExport.ts defaults as well
file = 'src/utils/docxExport.ts';
if (fs.existsSync(file)) {
  let docx = fs.readFileSync(file, 'utf8');
  docx = docx.replace(
    "const leftSigName = params.leftSig?.name || 'MD NAHID HASAN KHAN';",
    "const leftSigName = params.leftSig?.name || 'MD NAHID HASAN KHAN';"
  );
  docx = docx.replace(
    "const leftSigRank = params.leftSig?.rank || 'SGT';",
    "const leftSigRank = params.leftSig?.rank || 'SGT';"
  );
  docx = docx.replace(
    "const leftSigDesig = params.leftSig?.desig || 'Admin SNCO';",
    "const leftSigDesig = params.leftSig?.desig || 'UWO';"
  );
  
  docx = docx.replace(
    "const rightSigName = params.rightSig?.name || 'MD SHAHINUZZAMAN';",
    "const rightSigName = params.rightSig?.name || 'MAHIM RAAD SADAT';"
  );
  docx = docx.replace(
    "const rightSigRank = params.rightSig?.rank || 'WO';",
    "const rightSigRank = params.rightSig?.rank || 'FLT LT';"
  );
  docx = docx.replace(
    "const rightSigDesig = params.rightSig?.desig || 'WOIC Orderly Room';",
    "const rightSigDesig = params.rightSig?.desig || 'Adjutant';"
  );
  
  docx = docx.replace(
    "const lSigName = leftSig?.name || 'MD NAHID HASAN KHAN';",
    "const lSigName = leftSig?.name || 'MD NAHID HASAN KHAN';"
  );
  docx = docx.replace(
    "const lSigRank = leftSig?.rank || 'SGT';",
    "const lSigRank = leftSig?.rank || 'SGT';"
  );
  docx = docx.replace(
    "const lSigDesig = leftSig?.desig || 'Admin SNCO';",
    "const lSigDesig = leftSig?.desig || 'UWO';"
  );
  
  docx = docx.replace(
    "const rSigName = rightSig?.name || 'MD SHAHINUZZAMAN';",
    "const rSigName = rightSig?.name || 'MAHIM RAAD SADAT';"
  );
  docx = docx.replace(
    "const rSigRank = rightSig?.rank || 'WO';",
    "const rSigRank = rightSig?.rank || 'FLT LT';"
  );
  docx = docx.replace(
    "const rSigDesig = rightSig?.desig || 'WOIC Orderly Room';",
    "const rSigDesig = rightSig?.desig || 'Adjutant';"
  );
  fs.writeFileSync(file, docx);
}
