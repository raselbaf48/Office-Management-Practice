const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetAddUser = `detailedAt: new Date().toISOString(),
      detailedBy: 'System',
    };`;
const replacementAddUser = `detailedAt: new Date().toISOString(),
      detailedBy: 'System',
      flightName: '',
      trade: '',
      adminPass: '',
      ownerPass: '',
    };`;

content = content.replace(targetAddUser, replacementAddUser);
// wait, the previous replace failed because it was slightly different or I already ran it partially?
// Let's just regex replace the exact object creation.

content = content.replace(/detailedBy: 'System',?\s*\};/, "detailedBy: 'System',\n      flightName: '',\n      trade: '',\n      adminPass: '',\n      ownerPass: ''\n    };");

fs.writeFileSync(file, content);
