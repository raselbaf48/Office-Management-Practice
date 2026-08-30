const fs = require('fs');

// 1. Patch SignatureConfigModal.tsx
let file = 'src/components/SignatureConfigModal.tsx';
if (fs.existsSync(file)) {
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

  // Update Previews
  content = content.replace(
    /<div className="text-xs font-black uppercase text-slate-900 dark:text-white">\s*\{prepared.name \|\| 'NAME'\}\s*<\/div>\s*<div className="text-\[11px\] font-bold uppercase">\{prepared.rank \|\| 'RANK'\}<\/div>\s*<div className="text-\[10px\] font-normal">\{prepared.designation \|\| 'Designation'\}<\/div>\s*<div className="text-\[9px\] text-slate-500">\{prepared.unit \|\| '155 UASU BAF'\}<\/div>/g,
    `<div className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">
                  {prepared.name || 'NAME'}, {prepared.rank || 'RANK'}, {prepared.designation || 'Designation'}, {prepared.unit || '155 UASU BAF'}
                </div>`
  );

  content = content.replace(
    /<div className="text-xs font-black uppercase text-slate-900 dark:text-white">\s*\{authorized.name \|\| 'NAME'\}\s*<\/div>\s*<div className="text-\[11px\] font-bold uppercase">\{authorized.rank \|\| 'RANK'\}<\/div>\s*<div className="text-\[10px\] font-normal">\{authorized.designation \|\| 'Designation'\}<\/div>\s*<div className="text-\[9px\] text-slate-500">\{authorized.unit \|\| '155 UASU BAF'\}<\/div>/g,
    `<div className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">
                  {authorized.name || 'NAME'}, {authorized.rank || 'RANK'}, {authorized.designation || 'Designation'}, {authorized.unit || '155 UASU BAF'}
                </div>`
  );

  fs.writeFileSync(file, content);
}

// 2. Patch PrintableParadeStateModal.tsx
file = 'src/components/PrintableParadeStateModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Update defaults
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

  // Update HTML output
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
}

// 3. Update DocxExport.ts defaults
file = 'src/utils/docxExport.ts';
if (fs.existsSync(file)) {
  let docx = fs.readFileSync(file, 'utf8');
  
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
  
  // Update structure - leftSig
  docx = docx.replace(
    /children: \[\s*new TextRun\(\{\s*text: leftSigName\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: leftSigRank\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: leftSigDesig,\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*children: \[\s*new TextRun\(\{\s*text: '155 UASU BAF',\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    `children: [
              new TextRun({
                text: \`\${leftSigName.toUpperCase()}, \${leftSigRank.toUpperCase()}, \${leftSigDesig}, 155 UASU BAF\`,
                font: 'Arial',
                bold: true,
                size: 24,
              }),
            ],
          }),`
  );

  // Update structure - rightSig
  docx = docx.replace(
    /children: \[\s*new TextRun\(\{\s*text: rightSigName\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: rightSigRank\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: rightSigDesig,\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*children: \[\s*new TextRun\(\{\s*text: '155 UASU BAF',\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    `children: [
              new TextRun({
                text: \`\${rightSigName.toUpperCase()}, \${rightSigRank.toUpperCase()}, \${rightSigDesig}, 155 UASU BAF\`,
                font: 'Arial',
                bold: true,
                size: 24,
              }),
            ],
          }),`
  );

  // Update structure - lSig
  docx = docx.replace(
    /children: \[\s*new TextRun\(\{\s*text: lSigName\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: lSigRank\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: lSigDesig,\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.LEFT,\s*children: \[\s*new TextRun\(\{\s*text: '155 UASU BAF',\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    `children: [
                  new TextRun({
                    text: \`\${lSigName.toUpperCase()}, \${lSigRank.toUpperCase()}, \${lSigDesig}, 155 UASU BAF\`,
                    font: 'Arial',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),`
  );

  // Update structure - rSig
  docx = docx.replace(
    /children: \[\s*new TextRun\(\{\s*text: rSigName\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.RIGHT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: rSigRank\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.RIGHT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: rSigDesig,\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.RIGHT,\s*children: \[\s*new TextRun\(\{\s*text: '155 UASU BAF',\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    `children: [
                  new TextRun({
                    text: \`\${rSigName.toUpperCase()}, \${rSigRank.toUpperCase()}, \${rSigDesig}, 155 UASU BAF\`,
                    font: 'Arial',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),`
  );
  
  fs.writeFileSync(file, docx);
}
