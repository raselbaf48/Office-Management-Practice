const fs = require('fs');
let content = fs.readFileSync('src/components/UserManagementTab.tsx', 'utf8');

const target = "    setIsEditingProfile(false);\n  };\n\n  return (";
const replacement = "    setSelectedUser({\n      ...selectedUser,\n      name: editName,\n      rank: editRank,\n      flightName: editFlight,\n      mobileNo: editMobile,\n      role: editRole,\n      status: editStatus,\n      password: editPassword,\n      adminPass: editAdminPass,\n    });\n    setIsEditingProfile(false);\n  };\n\n  return (";

content = content.replace(target, replacement);
fs.writeFileSync('src/components/UserManagementTab.tsx', content);
