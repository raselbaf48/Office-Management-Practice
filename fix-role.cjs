const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/cleanInput === '48456' \? 'SUPER_ADMIN' : 'USER'/g, "cleanInput === '48456' ? 'OWNER' : 'USER'");
  content = content.replace(/cleanBd === '48456' \? 'SUPER_ADMIN' : 'USER'/g, "cleanBd === '48456' ? 'OWNER' : 'USER'");
  content = content.replace(/cleanBd === '48456' \? 'SUPER_ADMIN' : userDetail\.role/g, "cleanBd === '48456' ? 'OWNER' : userDetail.role");
  fs.writeFileSync(filePath, content);
}

replaceInFile('src/components/UserLoginGate.tsx');
replaceInFile('src/components/AdminPasscodeModal.tsx');
