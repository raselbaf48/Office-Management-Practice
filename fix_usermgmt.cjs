const fs = require('fs');
let code = fs.readFileSync('src/components/UserManagementTab.tsx', 'utf8');

// Filter active airmen
code = code.replace(/const list = nominalAirmen\.map\(\(airman, index\) => \{/g, `const list = nominalAirmen.filter(a => a.active).map((airman, index) => {`);

// Remove "Add Admin" state and handlers
code = code.replace(/const \[isAddAdminMode, setIsAddAdminMode\] = useState\(false\);\n  const \[addAdminBd, setAddAdminBd\] = useState\(''\);\n  const \[addAdminPass, setAddAdminPass\] = useState\(''\);\n  const \[addAdminFlight, setAddAdminFlight\] = useState\('ALL'\);\n  const \[addAdminSearch, setAddAdminSearch\] = useState\(''\);/, ``);

// Remove "Add Admin specific filtering" to end of handleAddAdminSubmit
code = code.replace(/\/\/ For Add Admin specific filtering[\s\S]*?handleAddAdminSubmit = \(\) => \{[\s\S]*?setErrorMsg\(''\);\n  \};/, '');

// Remove {isAddAdminMode ? ... : ...} wrapping and the Add Admin button
// This is a bit complex for a simple replace. I'll just remove the button and the isAddAdminMode logic.
