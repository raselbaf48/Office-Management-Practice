const fs = require('fs');

function fixUserManagement() {
  let file = 'src/components/UserManagementTab.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Add isOwner
  code = code.replace(
    /const isSuperAdmin = userSessionRole === 'SUPER_ADMIN';/,
    `const isSuperAdmin = userSessionRole === 'SUPER_ADMIN' || userSessionRole === 'OWNER';
  const isOwner = userSessionRole === 'OWNER';`
  );

  // Allow OWNER to change SUPER_ADMIN's role, but SUPER_ADMIN cannot edit another SUPER_ADMIN's role (unless maybe it's themselves, but let's restrict it).
  // Currently, the role dropdown is disabled if selectedUser.cleanBd === '48456'.
  // We want to also restrict it if selectedUser.role === 'SUPER_ADMIN' and !isOwner.

  code = code.replace(
    /isEditingProfile && selectedUser\.cleanBd !== '48456' \? \(/,
    `isEditingProfile && selectedUser.cleanBd !== '48456' && !(selectedUser.role === 'SUPER_ADMIN' && !isOwner) ? (`
  );

  code = code.replace(
    /isSuperAdmin && <option value="SUPER_ADMIN">Super Admin<\/option>/,
    `isOwner && <option value="SUPER_ADMIN">Super Admin</option>`
  );

  fs.writeFileSync(file, code);
}
fixUserManagement();
console.log('Fixed UserManagementTab permissions');
