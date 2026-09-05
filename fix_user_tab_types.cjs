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
    };`;

content = content.replace(targetAddUser, replacementAddUser);
fs.writeFileSync(file, content);
