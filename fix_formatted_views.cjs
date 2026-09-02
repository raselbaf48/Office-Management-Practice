const fs = require('fs');

function patchView(filename, viewName) {
  let code = fs.readFileSync(filename, 'utf8');

  // Add userFlight to props interface
  if (!code.includes('userFlight?: string;')) {
    code = code.replace(/role\?: UserRole;/, "role?: UserRole;\n  userFlight?: string;");
  }

  // Add userFlight to destructured args
  if (!code.includes('userFlight,')) {
    code = code.replace(/role = 'ADMIN',/, "role = 'ADMIN',\n  userFlight,");
  }

  // Find openEditDisposal and patch it
  if (!code.includes('airman.flightName !== userFlight')) {
    code = code.replace(/const openEditDisposal = \(airman: Airman, dutyCode: string, dutyName\?: string, note\?: string\) => \{/,
`const openEditDisposal = (airman: Airman, dutyCode: string, dutyName?: string, note?: string) => {
    if (role === 'ADMIN' && userFlight && airman.flightName !== userFlight) {
      alert("You are not authorized to edit disposals for personnel outside your flight.");
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (role === 'ADMIN' && selectedDate < todayStr) {
      alert("You cannot edit disposals for past dates.");
      return;
    }`);
  }

  fs.writeFileSync(filename, code);
}

patchView('src/components/ParadeStateFormattedView.tsx', 'ParadeStateFormattedView');
patchView('src/components/NightCountStateView.tsx', 'NightCountStateView');

// Also we need to pass userFlight from DashboardParadeState to these views.
let dbCode = fs.readFileSync('src/components/DashboardParadeState.tsx', 'utf8');
if (!dbCode.includes('userFlight={userFlight}')) {
  dbCode = dbCode.replace(/<ParadeStateFormattedView/g, "<ParadeStateFormattedView userFlight={userFlight}");
  dbCode = dbCode.replace(/<NightCountStateView/g, "<NightCountStateView userFlight={userFlight}");
  fs.writeFileSync('src/components/DashboardParadeState.tsx', dbCode);
}
