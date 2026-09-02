const fs = require('fs');

// 1. authSession.ts - Session Storage fix
let authCode = fs.readFileSync('src/utils/authSession.ts', 'utf8');
authCode = authCode.replace(
  /export const getCurrentUserSession = \(\): UserSession \| null => \{[\s\S]*?try \{[\s\S]*?const raw = localStorage\.getItem\(SESSION_KEY\);/,
  `export const getCurrentUserSession = (): UserSession | null => {
  try {
    localStorage.removeItem(SESSION_KEY); // Force clear persistent session
    const raw = sessionStorage.getItem(SESSION_KEY);`
);
authCode = authCode.replace(/localStorage\.setItem\(SESSION_KEY/g, "sessionStorage.setItem(SESSION_KEY");
authCode = authCode.replace(/localStorage\.removeItem\(SESSION_KEY\)/g, "sessionStorage.removeItem(SESSION_KEY)");
fs.writeFileSync('src/utils/authSession.ts', authCode);

// 2. UserLoginGate.tsx - Recent Logins
let gateCode = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');
if (!gateCode.includes('import { X }')) {
  gateCode = gateCode.replace(/import { Shield, ArrowRight/, "import { X, Shield, ArrowRight");
}
if (!gateCode.includes('recentLogins')) {
  gateCode = gateCode.replace(
    /const \[successAirman, setSuccessAirman\] = useState<Airman \| null>\(null\);/,
    `const [successAirman, setSuccessAirman] = useState<Airman | null>(null);

  const [recentLogins, setRecentLogins] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('baf_recent_logins');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const removeRecent = (id: string) => {
    const updated = recentLogins.filter(x => x !== id);
    setRecentLogins(updated);
    localStorage.setItem('baf_recent_logins', JSON.stringify(updated));
  };`
  );
}

gateCode = gateCode.replace(
  /setUserSession\(airman, validation\.detailedUser\?\.role \|\| 'USER', validation\.detailedUser\);/,
  `setUserSession(airman, validation.detailedUser?.role || 'USER', validation.detailedUser);
        const updatedRecents = [cleanInput, ...recentLogins.filter(x => x !== cleanInput)].slice(0, 4);
        setRecentLogins(updatedRecents);
        localStorage.setItem('baf_recent_logins', JSON.stringify(updatedRecents));`
);

// Insert recent logins UI
const searchStr = `className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-white outline-none transition-all"\n                />`;
const replaceStr = `className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-white outline-none transition-all"\n                />
                {recentLogins.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {recentLogins.map(id => (
                      <div key={id} className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-sm">
                        <button type="button" onClick={() => { setBdInput(id); setErrorMsg(''); }} className="text-[13px] font-mono font-bold text-slate-300 hover:text-emerald-400 mr-2 transition-colors">
                          {id}
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeRecent(id); }} className="text-slate-500 hover:text-red-400 p-0.5 rounded-full hover:bg-slate-700 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}`;
if (!gateCode.includes('recentLogins.length > 0')) {
  gateCode = gateCode.replace(searchStr, replaceStr);
}
fs.writeFileSync('src/components/UserLoginGate.tsx', gateCode);

// 3. Super Admin Bypass Fixes
function patchSuperAdmin(filename) {
  let code = fs.readFileSync(filename, 'utf8');

  if (filename.includes('AssignDutyModal')) {
    code = code.replace(
      /const isReadOnly = isPastDate;/,
      "const isSuperAdmin = session?.assignedRole === 'SUPER_ADMIN';\n  const isReadOnly = isPastDate && !isSuperAdmin;"
    );
    code = code.replace(
      /\|\| isPastDate;/g,
      "|| (isPastDate && !isSuperAdmin);"
    );
  } else if (filename.includes('ParadeStateFormattedView') || filename.includes('NightCountStateView')) {
    code = code.replace(
      /const isPastDate = disposalFromDate < todayStr;/g,
      "const isSuperAdmin = role === 'SUPER_ADMIN';\n                    const isPastDate = disposalFromDate < todayStr;"
    );
    code = code.replace(
      /\|\| isPastDate;/g,
      "|| (isPastDate && !isSuperAdmin);"
    );
    code = code.replace(
      /if \(disposalFromDate < todayStr\) \{/g,
      "if (disposalFromDate < todayStr && !isSuperAdmin) {"
    );
  } else if (filename.includes('LeaveRegisterView')) {
    code = code.replace(
      /const isPastDate = leaveFromDate < todayStr;/g,
      "const isSuperAdmin = session?.assignedRole === 'SUPER_ADMIN';\n                    const isPastDate = leaveFromDate < todayStr;"
    );
    code = code.replace(
      /\|\| isPastDate;/g,
      "|| (isPastDate && !isSuperAdmin);"
    );
    code = code.replace(
      /\{leaveFromDate < todayStr \? \(/g,
      "{leaveFromDate < todayStr && session?.assignedRole !== 'SUPER_ADMIN' ? ("
    );
  } else if (filename.includes('TdyRegisterView')) {
    code = code.replace(
      /const isPastDate = tdyFromDate < todayStr;/g,
      "const isSuperAdmin = session?.assignedRole === 'SUPER_ADMIN';\n                    const isPastDate = tdyFromDate < todayStr;"
    );
    code = code.replace(
      /\|\| isPastDate;/g,
      "|| (isPastDate && !isSuperAdmin);"
    );
    code = code.replace(
      /\{tdyFromDate < todayStr \? \(/g,
      "{tdyFromDate < todayStr && session?.assignedRole !== 'SUPER_ADMIN' ? ("
    );
  } else if (filename.includes('DeploymentRegisterView')) {
    code = code.replace(
      /const isPastDate = depFromDate < todayStr;/g,
      "const isSuperAdmin = session?.assignedRole === 'SUPER_ADMIN';\n                    const isPastDate = depFromDate < todayStr;"
    );
    code = code.replace(
      /\|\| isPastDate;/g,
      "|| (isPastDate && !isSuperAdmin);"
    );
    code = code.replace(
      /\{attFromDate < todayStr \? \(/g,
      "{attFromDate < todayStr && session?.assignedRole !== 'SUPER_ADMIN' ? ("
    );
  }

  fs.writeFileSync(filename, code);
}

patchSuperAdmin('src/components/AssignDutyModal.tsx');
patchSuperAdmin('src/components/ParadeStateFormattedView.tsx');
patchSuperAdmin('src/components/NightCountStateView.tsx');
patchSuperAdmin('src/components/LeaveRegisterView.tsx');
patchSuperAdmin('src/components/TdyRegisterView.tsx');
patchSuperAdmin('src/components/DeploymentRegisterView.tsx');

