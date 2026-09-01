const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/DutyRatioMatrixView.tsx',
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Make sure we have text-center and align-middle on <td> and <th>
    content = content.replace(/<(td|th)([^>]*)className="([^"]*)"([^>]*)>/g, (match, tag, before, classNames, after) => {
      let classes = classNames.split(' ');
      if (!classes.includes('text-center')) classes.push('text-center');
      if (!classes.includes('align-middle')) classes.push('align-middle');
      
      return `<${tag}${before}className="${classes.join(' ')}"${after}>`;
    });
    
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Patched alignment in', file);
  }
});

