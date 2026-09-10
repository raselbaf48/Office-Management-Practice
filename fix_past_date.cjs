const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    /session\?\.assignedRole !== 'SUPER_ADMIN' \?/g,
    "session?.assignedRole !== 'SUPER_ADMIN' && session?.assignedRole !== 'OWNER' ?"
  );
  fs.writeFileSync(filePath, content, 'utf8');
}

fixFile('src/components/TdyRegisterView.tsx');
fixFile('src/components/DeploymentRegisterView.tsx');
fixFile('src/components/LeaveRegisterView.tsx');

console.log("Fixed Tdy, Deployment, Leave views.");
