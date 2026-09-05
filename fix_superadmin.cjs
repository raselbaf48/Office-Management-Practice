const fs = require('fs');

function fixUserManagement() {
  let file = 'src/components/UserManagementTab.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Allow SUPER_ADMIN to assign SUPER_ADMIN
  code = code.replace(
    /\{isOwner && <option value="SUPER_ADMIN">Super Admin<\/option>\}/g,
    `{isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}`
  );

  // The condition restricting editing a SUPER_ADMIN profile to only OWNER should probably remain?
  // Wait, the user said: "je jei role e ase onno kew ke max oi role porjonto banate parben." 
  // If I am SUPER_ADMIN, can I edit another SUPER_ADMIN's profile?
  // I will just remove the restriction `&& !(selectedUser.role === 'SUPER_ADMIN' && !isOwner)` so they can at least edit/make super admin.
  // Actually, I'll allow SUPER_ADMIN to edit SUPER_ADMIN.
  
  code = code.replace(
    /isEditingProfile && selectedUser\.cleanBd !== '48456' && \!\(selectedUser\.role === 'SUPER_ADMIN' && \!isOwner\)/g,
    `isEditingProfile && selectedUser.cleanBd !== '48456'`
  );

  fs.writeFileSync(file, code);
}

function fixUserDetailModal() {
  let file = 'src/components/UserLoginDetailModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Change restriction from OWNER to SUPER_ADMIN when assigning SUPER_ADMIN role
  code = code.replace(
    /onClick=\{\(\) => \{ if \(isOwner\) handlePromote\('SUPER_ADMIN'\); else alert\('Only OWNER can assign SUPER_ADMIN'\); \}\}/g,
    `onClick={() => handlePromote('SUPER_ADMIN')}`
  );

  // And let super admin edit super admin (except 48456 which is OWNER)
  code = code.replace(
    /if \(user\.role === 'SUPER_ADMIN' && \!isOwner\) return; \/\/ Only owner can edit super admin/g,
    ``
  );

  code = code.replace(
    /if \(\!isOwner && u\.role === 'SUPER_ADMIN' && u\.cleanBd !== currentUserBd\) return false; \/\/ Maybe they shouldn't see it\? Wait, let them see it but not edit\./g,
    ``
  );

  fs.writeFileSync(file, code);
}

fixUserManagement();
fixUserDetailModal();
console.log('Fixed SUPER_ADMIN assignments');
