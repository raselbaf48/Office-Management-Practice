const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardParadeState.tsx', 'utf8');

if (!code.includes('const userFlight = userSession?.flightName;')) {
  code = code.replace(/const isSuperAdmin = userSession\?\.assignedRole === 'SUPER_ADMIN';/, `$&
  const isAdmin = userSession?.assignedRole === 'ADMIN';
  const userFlight = userSession?.flightName;
  const todayStr = new Date().toISOString().split('T')[0];
  const isPastDate = selectedDate < todayStr;
  const isReadOnly = isAdmin && isPastDate;`);
}

// In the quick actions (handleToggleDuty, etc)
code = code.replace(/const handleToggleDuty = async \(airmanId: string, dutyCode: DutyCategoryCode\) => \{/, 
`$&
    if (isReadOnly) return;
    const targetAirman = airmen.find(a => a.id === airmanId);
    if (isAdmin && userFlight && targetAirman?.flightName !== userFlight) {
       return; // Not allowed to edit other flights
    }`);

code = code.replace(/const handleSetDutyOff = async \(airmanId: string\) => \{/, 
`$&
    if (isReadOnly) return;
    const targetAirman = airmen.find(a => a.id === airmanId);
    if (isAdmin && userFlight && targetAirman?.flightName !== userFlight) {
       return;
    }`);

code = code.replace(/<button\n\s*key=\{duty\.code\}\n\s*onClick=\{\(\) => handleToggleDuty\(airman\.id, duty\.code\)\}/g, 
`<button
                              key={duty.code}
                              onClick={() => handleToggleDuty(airman.id, duty.code)}
                              disabled={isReadOnly || (isAdmin && !!userFlight && airman.flightName !== userFlight)}`);

code = code.replace(/onClick=\{\(\) => handleSetDutyOff\(airman\.id\)\}/g, `onClick={() => handleSetDutyOff(airman.id)} disabled={isReadOnly || (isAdmin && !!userFlight && airman.flightName !== userFlight)}`);

fs.writeFileSync('src/components/DashboardParadeState.tsx', code);
