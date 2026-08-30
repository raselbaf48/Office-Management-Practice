const fs = require('fs');

// 1. Patch SignatureConfigModal.tsx
let file = 'src/components/SignatureConfigModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Revert Defaults
  content = content.replace(
    "name: 'MD NAHID HASAN KHAN',\n  rank: 'SGT',\n  designation: 'UWO',\n  unit: '155 UASU BAF'",
    "name: 'MD NAHID HASAN KHAN',\n  rank: 'SGT',\n  designation: 'Admin SNCO',\n  unit: '155 UASU BAF'"
  );

  content = content.replace(
    "name: 'MAHIM RAAD SADAT',\n  rank: 'FLT LT',\n  designation: 'Adjutant',\n  unit: '155 UASU BAF'",
    "name: 'MD SHAHINUZZAMAN',\n  rank: 'WO',\n  designation: 'WOIC Orderly Room',\n  unit: '155 UASU BAF'"
  );

  // Revert Previews
  content = content.replace(
    /<div className="text-\[9px\] sm:text-\[10px\] font-bold text-slate-900 dark:text-white uppercase">\s*\{prepared.name \|\| 'NAME'\}, \{prepared.rank \|\| 'RANK'\}, \{prepared.designation \|\| 'Designation'\}, \{prepared.unit \|\| '155 UASU BAF'\}\s*<\/div>/g,
    `<div className="text-xs font-black uppercase text-slate-900 dark:text-white">
                  {prepared.name || 'NAME'}
                </div>
                <div className="text-[11px] font-bold uppercase">{prepared.rank || 'RANK'}</div>
                <div className="text-[10px] font-normal">{prepared.designation || 'Designation'}</div>
                <div className="text-[9px] text-slate-500">{prepared.unit || '155 UASU BAF'}</div>`
  );

  content = content.replace(
    /<div className="text-\[9px\] sm:text-\[10px\] font-bold text-slate-900 dark:text-white uppercase">\s*\{authorized.name \|\| 'NAME'\}, \{authorized.rank \|\| 'RANK'\}, \{authorized.designation \|\| 'Designation'\}, \{authorized.unit \|\| '155 UASU BAF'\}\s*<\/div>/g,
    `<div className="text-xs font-black uppercase text-slate-900 dark:text-white">
                  {authorized.name || 'NAME'}
                </div>
                <div className="text-[11px] font-bold uppercase">{authorized.rank || 'RANK'}</div>
                <div className="text-[10px] font-normal">{authorized.designation || 'Designation'}</div>
                <div className="text-[9px] text-slate-500">{authorized.unit || '155 UASU BAF'}</div>`
  );

  fs.writeFileSync(file, content);
}

// 2. Patch PrintableParadeStateModal.tsx
file = 'src/components/PrintableParadeStateModal.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Revert defaults
  content = content.replace(
    "useState(initialPrep.designation || 'UWO');",
    "useState(initialPrep.designation || 'Admin SNCO');"
  );
  content = content.replace(
    "useState(initialAuth.name || 'MAHIM RAAD SADAT');",
    "useState(initialAuth.name || 'MD SHAHINUZZAMAN');"
  );
  content = content.replace(
    "useState(initialAuth.rank || 'FLT LT');",
    "useState(initialAuth.rank || 'WO');"
  );
  content = content.replace(
    "useState(initialAuth.designation || 'Adjutant');",
    "useState(initialAuth.designation || 'WOIC Orderly Room');"
  );

  // Revert HTML output
  content = content.replace(
    /<p className="font-bold text-black uppercase text-\[10px\] tracking-wide">\s*\{leftSigName\}, \{leftSigRank\}, \{leftSigDesig\}, 155 UASU BAF\s*<\/p>/g,
    `<p className="font-bold text-black uppercase tracking-wide">
                              {leftSigName}
                            </p>
                            <p className="font-bold text-black uppercase">{leftSigRank}</p>
                            <p className="font-normal text-black">{leftSigDesig}</p>
                            <p className="font-normal text-black">155 UASU BAF</p>`
  );

  content = content.replace(
    /<p className="font-bold text-black uppercase text-\[10px\] tracking-wide">\s*\{rightSigName\}, \{rightSigRank\}, \{rightSigDesig\}, 155 UASU BAF\s*<\/p>/g,
    `<p className="font-bold text-black uppercase tracking-wide">
                              {rightSigName}
                            </p>
                            <p className="font-bold text-black uppercase">{rightSigRank}</p>
                            <p className="font-normal text-black">{rightSigDesig}</p>
                            <p className="font-normal text-black">155 UASU BAF</p>`
  );

  fs.writeFileSync(file, content);
}

// 3. Update DocxExport.ts defaults as well
file = 'src/utils/docxExport.ts';
if (fs.existsSync(file)) {
  let docx = fs.readFileSync(file, 'utf8');
  
  docx = docx.replace(
    "const leftSigDesig = params.leftSig?.desig || 'UWO';",
    "const leftSigDesig = params.leftSig?.desig || 'Admin SNCO';"
  );
  
  docx = docx.replace(
    "const rightSigName = params.rightSig?.name || 'MAHIM RAAD SADAT';",
    "const rightSigName = params.rightSig?.name || 'MD SHAHINUZZAMAN';"
  );
  docx = docx.replace(
    "const rightSigRank = params.rightSig?.rank || 'FLT LT';",
    "const rightSigRank = params.rightSig?.rank || 'WO';"
  );
  docx = docx.replace(
    "const rightSigDesig = params.rightSig?.desig || 'Adjutant';",
    "const rightSigDesig = params.rightSig?.desig || 'WOIC Orderly Room';"
  );
  
  docx = docx.replace(
    "const lSigDesig = leftSig?.desig || 'UWO';",
    "const lSigDesig = leftSig?.desig || 'Admin SNCO';"
  );
  
  docx = docx.replace(
    "const rSigName = rightSig?.name || 'MAHIM RAAD SADAT';",
    "const rSigName = rightSig?.name || 'MD SHAHINUZZAMAN';"
  );
  docx = docx.replace(
    "const rSigRank = rightSig?.rank || 'FLT LT';",
    "const rSigRank = rightSig?.rank || 'WO';"
  );
  docx = docx.replace(
    "const rSigDesig = rightSig?.desig || 'Adjutant';",
    "const rSigDesig = rightSig?.desig || 'WOIC Orderly Room';"
  );
  
  // Revert structure - leftSig
  docx = docx.replace(
    /children: \[\s*new TextRun\(\{\s*text: `\$\{leftSigName\.toUpperCase\(\)\}, \$\{leftSigRank\.toUpperCase\(\)\}, \$\{leftSigDesig\}, 155 UASU BAF`,\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    `children: [
              new TextRun({
                text: leftSigName.toUpperCase(),
                font: 'Arial',
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 20 },
            children: [
              new TextRun({
                text: leftSigRank.toUpperCase(),
                font: 'Arial',
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 20 },
            children: [
              new TextRun({
                text: leftSigDesig,
                font: 'Arial',
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: '155 UASU BAF',
                font: 'Arial',
                size: 24,
              }),
            ],
          }),`
  );

  // Revert structure - rightSig (using RIGHT alignment logic here for the multi-day might be different, let's fix exactly based on how docx was for single day)
  docx = docx.replace(
    /children: \[\s*new TextRun\(\{\s*text: `\$\{rightSigName\.toUpperCase\(\)\}, \$\{rightSigRank\.toUpperCase\(\)\}, \$\{rightSigDesig\}, 155 UASU BAF`,\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    `children: [
              new TextRun({
                text: rightSigName.toUpperCase(),
                font: 'Arial',
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: rightSigRank.toUpperCase(),
                font: 'Arial',
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 20 },
            children: [
              new TextRun({
                text: rightSigDesig,
                font: 'Arial',
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: '155 UASU BAF',
                font: 'Arial',
                size: 24,
              }),
            ],
          }),`
  );

  // Revert structure - lSig
  docx = docx.replace(
    /children: \[\s*new TextRun\(\{\s*text: `\$\{lSigName\.toUpperCase\(\)\}, \$\{lSigRank\.toUpperCase\(\)\}, \$\{lSigDesig\}, 155 UASU BAF`,\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    `children: [
                  new TextRun({
                    text: lSigName.toUpperCase(),
                    font: 'Arial',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: lSigRank.toUpperCase(),
                    font: 'Arial',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: lSigDesig,
                    font: 'Arial',
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: '155 UASU BAF',
                    font: 'Arial',
                    size: 24,
                  }),
                ],
              }),`
  );

  // Revert structure - rSig
  docx = docx.replace(
    /children: \[\s*new TextRun\(\{\s*text: `\$\{rSigName\.toUpperCase\(\)\}, \$\{rSigRank\.toUpperCase\(\)\}, \$\{rSigDesig\}, 155 UASU BAF`,\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    `children: [
                  new TextRun({
                    text: rSigName.toUpperCase(),
                    font: 'Arial',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: rSigRank.toUpperCase(),
                    font: 'Arial',
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 20 },
                children: [
                  new TextRun({
                    text: rSigDesig,
                    font: 'Arial',
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: '155 UASU BAF',
                    font: 'Arial',
                    size: 24,
                  }),
                ],
              }),`
  );
  
  fs.writeFileSync(file, docx);
}

