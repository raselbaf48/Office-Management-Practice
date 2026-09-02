const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagementTab.tsx', 'utf8');

// 1. Filter active airmen
code = code.replace(/const list = nominalAirmen\.map\(\(airman, index\) => \{/, 
`const list = nominalAirmen.filter(a => a.active).map((airman, index) => {`);

// 2. Remove Add Single Admin states
code = code.replace(/  \/\/ Single Add Admin Mode States\n.*?setAddAdminSearch\(''\);\n/s, '');

// 3. Remove Add Admin specific filtering
code = code.replace(/  \/\/ For Add Admin specific filtering[\s\S]*?const \[selectedUser/s, '  const [selectedUser');

// 4. Remove handleAddAdminSubmit
code = code.replace(/  const handleAddAdminSubmit = \(\) => \{[\s\S]*?setErrorMsg\(''\);\n  \};\n/s, '');

// 5. Fix header logic
code = code.replace(/\{selectedUser \|\| isAddAdminMode \? \(/, '{selectedUser ? (');
code = code.replace(/onClick=\{.*?setIsAddAdminMode.*?\}\}/s, 'onClick={() => closeProfile()}');
code = code.replace(/\{selectedUser \? 'User Profile & Access' : isAddAdminMode \? 'Add New Admin' : 'User Management'\}/, "{selectedUser ? 'User Profile & Access' : 'User Management'}");
code = code.replace(/\{selectedUser\s*\?\s*`BD\/\$\{selectedUser\.cleanBd\} - \$\{selectedUser\.airman\.rank\} \$\{selectedUser\.airman\.name\}`\s*:\s*isAddAdminMode\s*\?\s*'Promote a single user to Admin'\s*:\s*'Manage roles, passwords, and access for all nominal airmen'\}/s, "{selectedUser ? `BD/${selectedUser.cleanBd} - ${selectedUser.airman.rank} ${selectedUser.airman.name}` : 'Manage roles, passwords, and access for all nominal airmen'}");

// 6. Remove isAddAdminMode view
code = code.replace(/\{isAddAdminMode \? \([\s\S]*?\) : \(\n\s*\/\* List View \*\//s, '{/* List View */');

// 7. Remove + Add Admin button
code = code.replace(/\{\/\* Add Single Admin Button \*\/\}\n\s*\{isOwner && \([\s\S]*?\}\)\}/s, '');

// 8. Fix "User" naming
code = code.replace(/>\s*Normal\s*</g, '>User<');
code = code.replace(/>\s*Normal User\s*</g, '>User<');

// 9. Fix closing tags for List View removal
code = code.replace(/        <\/div>\n      \)\}\n    <\/div>\n  \);\n\};/s, '        </div>\n    </div>\n  );\n};');

fs.writeFileSync('src/components/UserManagementTab.tsx', code);
