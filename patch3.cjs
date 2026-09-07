const fs = require('fs');
let code = fs.readFileSync('src/components/UserLoginDetailModal.tsx', 'utf8');

const target1 = `    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    closeProfile();
  };`;

const replacement1 = `    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    
    if (selectedUser.role !== editRole) {
      fetch('/api/system/log-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airmanId: selectedUser.airman.id,
          airmanName: selectedUser.airman.name,
          description: \`Promoted/Demoted \${selectedUser.airman.rank} \${selectedUser.airman.name} to \${editRole === 'SUPER_ADMIN' ? 'Super Admin' : editRole === 'ADMIN' ? 'Admin' : 'User'}\`
        })
      }).catch(console.error);
    }
    closeProfile();
  };`;

code = code.replace(target1, replacement1);

const target2 = `    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    setIsAddAdminMode(false);`;

const replacement2 = `    saveDetailedUsers(updatedDetailedUsers);
    setDetailedUsers(updatedDetailedUsers);
    
    fetch('/api/system/log-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        airmanId: userSource.airman.id,
        airmanName: userSource.airman.name,
        description: \`Promoted/Demoted \${userSource.airman.rank} \${userSource.airman.name} to Admin\`
      })
    }).catch(console.error);

    setIsAddAdminMode(false);`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/UserLoginDetailModal.tsx', code);
