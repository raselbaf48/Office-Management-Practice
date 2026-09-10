const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

content = content.replace(
  /localStorage\.setItem\('baf_recent_logins', JSON\.stringify\(updatedRecents\)\);/g,
  `localStorage.setItem('baf_recent_logins', JSON.stringify(updatedRecents));
        localStorage.setItem('baf_last_used_id', cleanInput);`
);

fs.writeFileSync('src/components/UserLoginGate.tsx', content, 'utf8');
