const fs = require('fs');
const file = 'src/utils/authSession.ts';
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `      } else {
        // Suspend user if they are inactive in nominal roll
        if (!a.active && parsed[idx].status === 'ACTIVE') {
          parsed[idx].status = 'SUSPENDED';
          modified = true;
        }
      }`;

const newLogic = `      } else {
        // Sync status based on nominal roll activity
        if (!a.active && parsed[idx].status === 'ACTIVE') {
          parsed[idx].status = 'SUSPENDED';
          modified = true;
        } else if (a.active && parsed[idx].status === 'SUSPENDED') {
          parsed[idx].status = 'ACTIVE';
          modified = true;
        }
      }`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync(file, content);
  console.log("Fixed auto active logic in authSession.ts");
} else {
  console.log("Could not find the old logic string in authSession.ts");
}
