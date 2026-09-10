const fs = require('fs');
let content = fs.readFileSync('src/utils/authSession.ts', 'utf8');

content = content.replace(/Invalid User ID or Password/g, 'Invalid User ID or PIN');
content = content.replace(/Password Verification/g, 'PIN Verification');
content = content.replace(/Password updated successfully/g, 'PIN updated successfully');
content = content.replace(/Admin Password updated successfully/g, 'Admin PIN updated successfully');

fs.writeFileSync('src/utils/authSession.ts', content, 'utf8');
