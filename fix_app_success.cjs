const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace onSuccess in AdminPasscodeModal
content = content.replace(
  /onSuccess=\{\(newRole\) => \{\s*handleRoleChange\(newRole\);\s*setIsAdminLoginModalOpen\(false\);\s*\}\}/,
  `onSuccess={(newRole) => {
          handleRoleChange(newRole);
          if (userSession) {
             const updatedSession = { ...userSession, assignedRole: newRole };
             setUserSession(updatedSession);
             sessionStorage.setItem('baf_user_session', JSON.stringify(updatedSession));
          }
          setIsAdminLoginModalOpen(false);
        }}`
);

// Also need to handle logout admin, which currently is:
// onLogoutAdmin={() => handleRoleChange('USER')}
// We should update the session when logging out of Admin too.
content = content.replace(
  /onLogoutAdmin=\{\(\) => handleRoleChange\('USER'\)\}/g,
  `onLogoutAdmin={() => {
            handleRoleChange('USER');
            if (userSession) {
               const updatedSession = { ...userSession, assignedRole: 'USER' };
               setUserSession(updatedSession);
               sessionStorage.setItem('baf_user_session', JSON.stringify(updatedSession));
            }
          }}`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx onSuccess and onLogoutAdmin");
