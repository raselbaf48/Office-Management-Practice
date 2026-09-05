const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the auto-escalate logic
content = content.replace(
  /\} else if \(myDetail\.role !== userSession\.assignedRole\) \{[\s\S]*?setUserSession\(updatedSession\);\s*localStorage\.setItem\('baf_user_session', JSON\.stringify\(updatedSession\)\);\s*\}/,
  `} else {
            // Only demote if their current active role is higher than what's allowed in myDetail
            const roleHierarchy = { 'SUPER_ADMIN': 3, 'ADMIN': 2, 'USER': 1 };
            const currentActiveRole = sessionStorage.getItem('baf_user_role') || 'USER';
            if (roleHierarchy[currentActiveRole] > roleHierarchy[myDetail.role]) {
              handleRoleChange(myDetail.role);
              const updatedSession = { ...userSession, assignedRole: myDetail.role };
              setUserSession(updatedSession);
              sessionStorage.setItem('baf_user_session', JSON.stringify(updatedSession));
            }
          }`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx");
