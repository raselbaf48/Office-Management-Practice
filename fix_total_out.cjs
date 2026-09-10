const fs = require('fs');

const files = [
  'src/components/PrintableParadeStateModal.tsx',
  'src/components/ParadeStateFormattedView.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  const search = `absentCount +\n othersCount;`;
  const replace = `absentCount +\n canteenCount +\n othersCount;`;

  if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched totalOut in ${file}`);
  } else {
    console.log(`Could not find search string in ${file}`);
  }
});
