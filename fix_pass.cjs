const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagementTab.tsx', 'utf8');

code = code.replace(/\{\/\* Password Fields \*\/\}/, `{/* Password Fields */}
              {isOwner && (`);

code = code.replace(/<\/div>\n\n              <div className="mt-6 space-y-2">/g, `</div>
              )}\n\n              <div className="mt-6 space-y-2">`);

fs.writeFileSync('src/components/UserManagementTab.tsx', code);
