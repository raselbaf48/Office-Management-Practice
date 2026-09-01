const fs = require('fs');

const files = [
  'src/components/PrintableNightCountModal.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  if (code.includes('savedDisposals.length > 0 && (')) {
    code = code.replace(
      'savedDisposals.length > 0 && (',
      "savedDisposals.length > 0 && sessionStorage.getItem('baf_user_role') === 'SUPER_ADMIN' && ("
    );
  }
  
  fs.writeFileSync(file, code);
  console.log('Patched', file);
});
