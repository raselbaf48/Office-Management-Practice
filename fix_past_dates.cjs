const fs = require('fs');

// 1. AssignDutyModal.tsx
let assignCode = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');
assignCode = assignCode.replace(
  /const isPastDate = \(selectedDate \|\| new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\) < new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];/,
  "const isPastDate = fromDate < new Date().toISOString().split('T')[0];"
);
assignCode = assignCode.replace(
  /const isReadOnly = isAdmin && isPastDate;/,
  "const isReadOnly = isPastDate;"
);
assignCode = assignCode.replace(
  /const isDisabledFlt = \(isAdmin && adminFlight && flt !== adminFlight\) \|\| \(isAdmin && isPastDate\);/g,
  "const isDisabledFlt = (isAdmin && adminFlight && flt !== adminFlight) || isPastDate;"
);
fs.writeFileSync('src/components/AssignDutyModal.tsx', assignCode);

// 2. ParadeStateFormattedView.tsx
let paradeCode = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');
paradeCode = paradeCode.replace(
  /const isDisabledFlt = \(role === 'ADMIN' && userFlight && fl !== userFlight\) \|\| \(role === 'ADMIN' && selectedDate < todayStr\);/g,
  "const isPastDate = disposalFromDate < todayStr;\n                    const isDisabledFlt = (role === 'ADMIN' && userFlight && fl !== userFlight) || isPastDate;"
);
paradeCode = paradeCode.replace(
  /if \(role === 'ADMIN' && selectedDate < todayStr\) \{/g,
  "if (disposalFromDate < todayStr) {"
);
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', paradeCode);

// 3. NightCountStateView.tsx
let nightCode = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf8');
nightCode = nightCode.replace(
  /const isDisabledFlt = \(role === 'ADMIN' && userFlight && fl !== userFlight\) \|\| \(role === 'ADMIN' && selectedDate < todayStr\);/g,
  "const isPastDate = disposalFromDate < todayStr;\n                    const isDisabledFlt = (role === 'ADMIN' && userFlight && fl !== userFlight) || isPastDate;"
);
nightCode = nightCode.replace(
  /if \(role === 'ADMIN' && selectedDate < todayStr\) \{/g,
  "if (disposalFromDate < todayStr) {"
);
fs.writeFileSync('src/components/NightCountStateView.tsx', nightCode);

// 4. LeaveRegisterView.tsx
let leaveCode = fs.readFileSync('src/components/LeaveRegisterView.tsx', 'utf8');
leaveCode = leaveCode.replace(
  /const isDisabledFlt = \(isAdmin && adminFlight && flt !== adminFlight\) \|\| \(isAdmin && isPastDate\);/g,
  "const isDisabledFlt = (isAdmin && adminFlight && flt !== adminFlight) || isPastDate;"
);
const leaveSelectRegex = /\{\/\* Select Airman \([\s\S]*?\)\s*\*\/\}[\s\S]*?<select[\s\S]*?<\/select>/m;
if (leaveCode.match(leaveSelectRegex)) {
  leaveCode = leaveCode.replace(leaveSelectRegex, (match) => {
    const beforeSelect = match.substring(0, match.indexOf('<select'));
    const selectHtml = match.substring(match.indexOf('<select'));
    return `${beforeSelect}
                {leaveFromDate < todayStr ? (
                  <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-slate-500 text-center">
                    🚫 Cannot modify past dates.
                  </div>
                ) : (
                  ${selectHtml}
                )}`;
  });
}
fs.writeFileSync('src/components/LeaveRegisterView.tsx', leaveCode);

// 5. TdyRegisterView.tsx (update to remove isAdmin requirement for past date block)
let tdyCode = fs.readFileSync('src/components/TdyRegisterView.tsx', 'utf8');
tdyCode = tdyCode.replace(
  /const isDisabledFlt = \(isAdmin && adminFlight && flt !== adminFlight\) \|\| \(isAdmin && isPastDate\);/g,
  "const isDisabledFlt = (isAdmin && adminFlight && flt !== adminFlight) || isPastDate;"
);
tdyCode = tdyCode.replace(
  /\{isAdmin && tdyFromDate < todayStr \? \(/g,
  "{tdyFromDate < todayStr ? ("
);
fs.writeFileSync('src/components/TdyRegisterView.tsx', tdyCode);

// 6. DeploymentRegisterView.tsx
let depCode = fs.readFileSync('src/components/DeploymentRegisterView.tsx', 'utf8');
depCode = depCode.replace(
  /const isDisabledFlt = \(isAdmin && adminFlight && flt !== adminFlight\) \|\| \(isAdmin && isPastDate\);/g,
  "const isDisabledFlt = (isAdmin && adminFlight && flt !== adminFlight) || isPastDate;"
);
depCode = depCode.replace(
  /\{isAdmin && attFromDate < todayStr \? \(/g,
  "{attFromDate < todayStr ? ("
);
fs.writeFileSync('src/components/DeploymentRegisterView.tsx', depCode);

