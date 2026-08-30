const fs = require('fs');
let file = 'src/utils/docxExport.ts';
if (fs.existsSync(file)) {
  let docx = fs.readFileSync(file, 'utf8');

  docx = docx.replace(
    /text: rSigName\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.RIGHT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: rSigRank\.toUpperCase\(\),\s*font: 'Arial',\s*bold: true,\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.RIGHT,\s*spacing: \{\s*after:\s*\d+\s*\},\s*children: \[\s*new TextRun\(\{\s*text: rSigDesig,\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),\s*new Paragraph\(\{\s*alignment: AlignmentType\.RIGHT,\s*children: \[\s*new TextRun\(\{\s*text: '155 UASU BAF',\s*font: 'Arial',\s*size: 24,\s*\}\),\s*\],\s*\}\),/g,
    "text: `${rSigName.toUpperCase()}, ${rSigRank.toUpperCase()}, ${rSigDesig}, 155 UASU BAF`,\n                    font: 'Arial',\n                    bold: true,\n                    size: 24,\n                  }),\n                ],\n              }),"
  );
  fs.writeFileSync(file, docx);
}
