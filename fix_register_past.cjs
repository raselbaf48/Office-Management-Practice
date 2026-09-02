const fs = require('fs');

function patchRegister(filename, dateStateName, grantListVarName, airmanStateName) {
  let code = fs.readFileSync(filename, 'utf8');

  if (!code.includes("const todayStr = new Date().toISOString().split('T')[0];")) {
     code = code.replace(/const session = getCurrentUserSession\(\);/, "const todayStr = new Date().toISOString().split('T')[0];\n  const session = getCurrentUserSession();");
  }

  // Update isDisabledFlt inside the modal
  const modalRegex = /const isDisabledFlt = isAdmin && adminFlight && flt !== adminFlight;/g;
  code = code.replace(modalRegex, `const isPastDate = ${dateStateName} < todayStr;\n                    const isDisabledFlt = (isAdmin && adminFlight && flt !== adminFlight) || (isAdmin && isPastDate);`);

  // Update the select airman part
  // Find {/* Select Airman */} and replace the <select> ... </select> part
  const selectRegex = new RegExp(`\\{\\/\\* Select Airman \\*\\/\\}[\\s\\S]*?<select[\\s\\S]*?<\\/select>`, 'm');
  
  if (code.match(selectRegex)) {
    code = code.replace(selectRegex, (match) => {
      // Find where <select starts
      const beforeSelect = match.substring(0, match.indexOf('<select'));
      const selectHtml = match.substring(match.indexOf('<select'));
      
      return `${beforeSelect}
                {isAdmin && ${dateStateName} < todayStr ? (
                  <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-slate-500 text-center">
                    🚫 Cannot modify past dates.
                  </div>
                ) : (
                  ${selectHtml}
                )}`;
    });
  }

  fs.writeFileSync(filename, code);
}

patchRegister('src/components/TdyRegisterView.tsx', 'tdyFromDate', 'grantAirmenList', 'tdyAirmanId');
patchRegister('src/components/LeaveRegisterView.tsx', 'leaveFromDate', 'grantLeaveAirmenList', 'leaveAirmanId');
patchRegister('src/components/DeploymentRegisterView.tsx', 'depFromDate', 'grantDepAirmenList', 'depAirmanId');
