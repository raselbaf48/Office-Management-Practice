const fs = require('fs');
const file = 'src/utils/authSession.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("enforceOwner(SYSTEM_OWNER, '53539919', '54549919', '1124');", "");

fs.writeFileSync(file, content);
