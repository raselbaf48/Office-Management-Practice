const fs = require('fs');
const file = 'src/components/UserManagementTab.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/user\.airman\?\.name \|\| user\.name/g, "user.name || user.airman?.name");
content = content.replace(/user\.airman\?\.rank \|\| user\.rank/g, "user.rank || user.airman?.rank");
content = content.replace(/selectedUser\.airman\?\.name \|\| selectedUser\.name/g, "selectedUser.name || selectedUser.airman?.name");
content = content.replace(/selectedUser\.airman\?\.rank \|\| selectedUser\.rank/g, "selectedUser.rank || selectedUser.airman?.rank");
content = content.replace(/selectedUser\.airman\?\.flightName \|\| selectedUser\.flightName/g, "selectedUser.flightName || selectedUser.airman?.flightName");
content = content.replace(/selectedUser\.airman\?\.mobileNo \|\| selectedUser\.mobileNo/g, "selectedUser.mobileNo || selectedUser.airman?.mobileNo");

fs.writeFileSync(file, content);
