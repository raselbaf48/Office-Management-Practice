const fs = require('fs');

let settingsCode = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');
if (!settingsCode.includes('userFlight={userFlight}')) {
  settingsCode = settingsCode.replace(/<UserManagementTab nominalAirmen=\{nominalAirmen\} userSessionRole=\{role\} \/>/,
    "<UserManagementTab nominalAirmen={nominalAirmen} userSessionRole={role} userFlight={userFlight} />");
  fs.writeFileSync('src/components/SettingsModal.tsx', settingsCode);
}

let umCode = fs.readFileSync('src/components/UserManagementTab.tsx', 'utf8');
if (!umCode.includes('userFlight?: string;')) {
  umCode = umCode.replace(/userSessionRole\?: string;/, "userSessionRole?: string;\n  userFlight?: string;");
  umCode = umCode.replace(/userSessionRole,/, "userSessionRole,\n  userFlight,");
  
  // Filter by flight for ADMIN
  umCode = umCode.replace(/const activeAirmen = useMemo\(\(\) => nominalAirmen\.filter\(a => a\.active\), \[nominalAirmen\]\);/,
    "const activeAirmen = useMemo(() => nominalAirmen.filter(a => a.active && (!(userSessionRole === 'ADMIN' && userFlight) || a.flightName === userFlight)), [nominalAirmen, userSessionRole, userFlight]);");
    
  fs.writeFileSync('src/components/UserManagementTab.tsx', umCode);
}
