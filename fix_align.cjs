const fs = require('fs');

const files = [
  'src/components/NightCountStateView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/DutyRatioMatrixView.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    // For th
    content = content.replace(/<th className="([^"]*)"/g, (match, classes) => {
      if (!classes.includes('text-center')) classes += ' text-center';
      if (!classes.includes('align-middle')) classes += ' align-middle';
      return `<th className="${classes}"`;
    });
    // For td
    content = content.replace(/<td className="([^"]*)"/g, (match, classes) => {
      if (!classes.includes('text-center')) classes += ' text-center';
      if (!classes.includes('align-middle')) classes += ' align-middle';
      return `<td className="${classes}"`;
    });
    fs.writeFileSync(file, content, 'utf-8');
    console.log(`Aligned ${file}`);
  }
});
