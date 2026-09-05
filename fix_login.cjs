const fs = require('fs');

let file = 'src/components/UserLoginGate.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /if \(isFeatureActive\(config.maintenance\) && role !== 'SUPER_ADMIN'\) \{/g,
  `if (isFeatureActive(config.maintenance) && role !== 'SUPER_ADMIN' && role !== 'OWNER') {`
);

fs.writeFileSync(file, code);
console.log('Fixed UserLoginGate.tsx');
