const fs = require('fs');

function fixUserModal() {
  let file = 'src/components/UserLoginDetailModal.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Change isOwner logic
  code = code.replace(
    /const isOwner = userSessionRole === 'SUPER_ADMIN';/,
    `const isOwner = userSessionRole === 'OWNER';
  const isSuperAdmin = userSessionRole === 'SUPER_ADMIN' || userSessionRole === 'OWNER';`
  );

  // Update logic to allow SUPER_ADMIN or OWNER to manage standard users, but only OWNER to manage SUPER_ADMIN.
  // We'll update the function openProfile to allow isSuperAdmin.

  code = code.replace(
    /const openProfile = \(user: typeof mergedUsers\[0\]\) => \{\s*if \(\!isOwner\) return;/,
    `const openProfile = (user: typeof mergedUsers[0]) => {
    if (!isSuperAdmin) return;
    if (user.role === 'SUPER_ADMIN' && !isOwner) return; // Only owner can edit super admin`
  );

  code = code.replace(
    /if \(\!isOwner && u\.role === 'SUPER_ADMIN'\) return false;/,
    `if (!isOwner && u.role === 'SUPER_ADMIN' && u.cleanBd !== currentUserBd) return false; // Maybe they shouldn't see it? Wait, let them see it but not edit.`
  );
  
  code = code.replace(
    /\{isOwner && \(/g,
    `{isSuperAdmin && (`
  );

  code = code.replace(
    /if \(isOwner\) openProfile\(user\);/g,
    `if (isSuperAdmin) openProfile(user);`
  );

  code = code.replace(
    /className=\{\`transition-colors \$\{isOwner \? 'cursor-pointer/g,
    `className={\`transition-colors \${isSuperAdmin ? 'cursor-pointer`
  );

  // Also in dropdown for role in this modal
  code = code.replace(
    /onClick=\{\(\) => handlePromote\('SUPER_ADMIN'\)\}/g,
    `onClick={() => { if (isOwner) handlePromote('SUPER_ADMIN'); else alert('Only OWNER can assign SUPER_ADMIN'); }}`
  );

  fs.writeFileSync(file, code);
}
fixUserModal();
console.log('Fixed UserLoginDetailModal');
