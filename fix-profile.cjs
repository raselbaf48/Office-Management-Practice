const fs = require('fs');

let content = fs.readFileSync('src/components/UserManagementTab.tsx', 'utf8');

const target = `    setIsEditingProfile(false);
  };`;

const replacement = `    setSelectedUser({
      ...selectedUser,
      name: editName,
      rank: editRank,
      flightName: editFlight,
      mobileNo: editMobile,
      role: editRole,
      status: editStatus,
      password: editPassword,
      adminPass: editAdminPass,
    });
    
    setIsEditingProfile(false);
  };`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/UserManagementTab.tsx', content);
