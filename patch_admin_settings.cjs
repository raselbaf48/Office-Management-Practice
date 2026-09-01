const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/FlyingWingStateView.tsx'
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  
  // For ParadeStateFormattedView and NightCountStateView
  if (code.includes('savedDisposals.length > 0 && (')) {
    code = code.replace(
      'savedDisposals.length > 0 && (',
      "savedDisposals.length > 0 && sessionStorage.getItem('baf_user_role') === 'SUPER_ADMIN' && ("
    );
  }
  
  // For FlyingWingStateView
  if (code.includes('title="Manage Categories"')) {
    const buttonRegex = /<button\s+type="button"\s+onClick=\{\(\) => setIsEditingDisposals\(!isEditingDisposals\)\}.*?<\/button>/s;
    if (code.match(buttonRegex)) {
       const replacement = `{sessionStorage.getItem('baf_user_role') === 'SUPER_ADMIN' && (
                      $&
                      )}`;
       code = code.replace(buttonRegex, replacement);
    }
  }

  fs.writeFileSync(file, code);
  console.log('Patched', file);
});
