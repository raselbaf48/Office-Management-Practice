const fs = require('fs');
let content = fs.readFileSync('src/utils/docxExport.ts', 'utf8');

// I'll just use string slice and replace to make sure we replace the whole block from "const onParade1To15 =" to "});\n  }"
let startIdx = content.indexOf('  // Col 1: On Parade 1..15 on left, 16+ on right');
let endIdx = content.indexOf('  // Col 2: Leave, Bake & Bite', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  let newBlock = `  // Col 1: On Parade up to 3 columns (1-15, 16-30, 31-45)
  const onParade1To15 = onParade.slice(0, 15);
  const onParade16To30 = onParade.slice(15, 30);
  const onParade31Plus = onParade.slice(30, 45);

  const col1Children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: isPt ? 'ON PT' : 'ON PARADE',
          font: 'Arial',
          bold: true,
          size: 24,
          underline: {},
        }),
      ],
    }),
  ];

  if (onParade.length === 0) {
    col1Children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Nil', font: 'Arial', bold: true, size: 24 })],
      })
    );
  } else if (onParade.length <= 15) {
    onParade.forEach((a, idx) => {
      col1Children.push(
        new Paragraph({
          spacing: { after: 15, line: 240 },
          children: [
            new TextRun({
              text: \`\${idx + 1}. \${a.rank} \${a.name}\`,
              font: 'Arial',
              size: 22,
            }),
          ],
        })
      );
    });
  } else {
    const maxRows = Math.max(onParade1To15.length, onParade16To30.length, onParade31Plus.length);
    const innerRows: TableRow[] = [];
    for (let i = 0; i < maxRows; i++) {
      const col1Item = onParade1To15[i];
      const col2Item = onParade16To30[i];
      const col3Item = onParade31Plus[i];
      const col1Text = col1Item ? \`\${i + 1}. \${col1Item.rank} \${col1Item.name}\` : '';
      const col2Text = col2Item ? \`\${16 + i}. \${col2Item.rank} \${col2Item.name}\` : '';
      const col3Text = col3Item ? \`\${31 + i}. \${col3Item.rank} \${col3Item.name}\` : '';

      innerRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 1680, type: WidthType.DXA },
              borders: invisibleBorders,
              margins: { top: 0, bottom: 20, left: 0, right: 10 },
              children: [
                new Paragraph({
                  spacing: { after: 15, line: 240 },
                  children: [new TextRun({ text: col1Text, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 1680, type: WidthType.DXA },
              borders: invisibleBorders,
              margins: { top: 0, bottom: 20, left: 0, right: 10 },
              children: [
                new Paragraph({
                  spacing: { after: 15, line: 240 },
                  children: [new TextRun({ text: col2Text, font: 'Arial', size: 22 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 1680, type: WidthType.DXA },
              borders: invisibleBorders,
              margins: { top: 0, bottom: 20, left: 0, right: 0 },
              children: [
                new Paragraph({
                  spacing: { after: 15, line: 240 },
                  children: [new TextRun({ text: col3Text, font: 'Arial', size: 22 })],
                }),
              ],
            }),
          ],
        })
      );
    }
    col1Children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: invisibleBorders,
        rows: innerRows,
      })
    );
  }

`;
  
  content = content.substring(0, startIdx) + newBlock + content.substring(endIdx);
  fs.writeFileSync('src/utils/docxExport.ts', content);
  console.log("Patched successfully");
} else {
  console.log("Could not find boundaries");
}
