const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
  /<AdminPasscodeModal\s+isOpen=\{isAdminLoginModalOpen\}/,
  `<AdminPasscodeModal\n        isOpen={isAdminLoginModalOpen}\n        airmen={airmen}`
);
fs.writeFileSync('src/App.tsx', appCode);

let modalCode = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');
modalCode = modalCode.replace(
  /bdNo\?: string;\n\}/,
  `bdNo?: string;\n  airmen?: Airman[];\n}`
);

modalCode = modalCode.replace(
  /assignedRole = 'USER',\n  bdNo = '',\n\}\) => \{/,
  `assignedRole = 'USER',\n  bdNo = '',\n  airmen = [],\n}) => {`
);

modalCode = modalCode.replace(
  /const airman = INITIAL_AIRMEN\.find/,
  `const airman = airmen.find`
);

fs.writeFileSync('src/components/AdminPasscodeModal.tsx', modalCode);

console.log("Success");
