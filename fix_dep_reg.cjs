const fs = require('fs');

function fixDep() {
  let file = 'src/components/DeploymentRegisterView.tsx';
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Change from 'DUTY' to 'ATT'
  code = code.replace(
    /initialCategory: 'DUTY'/g,
    `initialCategory: 'ATT'`
  );

  fs.writeFileSync(file, code);
}
fixDep();
console.log('Fixed Deployment Register Category');
