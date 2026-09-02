const fs = require('fs');
let code = fs.readFileSync('src/components/AssignDutyModal.tsx', 'utf8');

if (!code.includes('getCurrentUserSession')) {
  code = code.replace(/import \{ getStoredDutyRatiosForDate \}/, `import { getCurrentUserSession } from '../utils/authSession';\nimport { getStoredDutyRatiosForDate }`);
}

// Inside the component
if (!code.includes('const session = getCurrentUserSession()')) {
  code = code.replace(/const \[dateMode, setDateMode\] = useState/, `const session = getCurrentUserSession();\n  const isSuperAdmin = session?.assignedRole === 'SUPER_ADMIN';\n  const isAdmin = session?.assignedRole === 'ADMIN';\n  const adminFlight = session?.flightName;\n  const isPastDate = fromDate < new Date().toISOString().split('T')[0];\n  const isReadOnly = isAdmin && isPastDate;\n\n  const [dateMode, setDateMode] = useState`);
}

// In filteredAirmen (around line 527)
code = code.replace(/return airmen\n      \.filter\(\(airman\) => \{/s, 
`return airmen\n      .filter((airman) => {
        // Admin restriction
        if (isAdmin && adminFlight && airman.flightName !== adminFlight) {
          return false;
        }`);

// Disable assignment buttons if isReadOnly
code = code.replace(/disabled=\{processingAirmanId === airman\.id\}/g, `disabled={processingAirmanId === airman.id || isReadOnly}`);

// Remove processingAirmanId onClick protection if isReadOnly
code = code.replace(/onClick=\{\(\) => !processingAirmanId && toggleAssignment\(airman\.id\)\}/g, `onClick={() => !processingAirmanId && !isReadOnly && toggleAssignment(airman.id)}`);

// Restrict flight dropdown
code = code.replace(/<select\n\s*value=\{activeFlight\}\n\s*onChange=\{\(e\) => setActiveFlight\(e\.target\.value as any\)\}/s, 
`<select
                    value={activeFlight}
                    onChange={(e) => setActiveFlight(e.target.value as any)}
                    disabled={isAdmin && !!adminFlight}`);
                    
code = code.replace(/<option value="All">All Flt\(\*\)<\/option>/, 
`{(!isAdmin || !adminFlight) && <option value="All">All Flt(*)</option>}`);

code = code.replace(/<option value="Avionics">Avionics<\/option>/g, `{(!isAdmin || adminFlight === 'Avionics') && <option value="Avionics">Avionics</option>}`);
code = code.replace(/<option value="Mechanics">Mechanics<\/option>/g, `{(!isAdmin || adminFlight === 'Mechanics') && <option value="Mechanics">Mechanics</option>}`);
code = code.replace(/<option value="GCS">GCS<\/option>/g, `{(!isAdmin || adminFlight === 'GCS') && <option value="GCS">GCS</option>}`);
code = code.replace(/<option value="Admin">Admin<\/option>/g, `{(!isAdmin || adminFlight === 'Admin') && <option value="Admin">Admin</option>}`);
code = code.replace(/<option value="MTF">MTF<\/option>/g, `{(!isAdmin || adminFlight === 'MTF') && <option value="MTF">MTF</option>}`);
code = code.replace(/<option value="Ops">Ops<\/option>/g, `{(!isAdmin || adminFlight === 'Ops') && <option value="Ops">Ops</option>}`);
code = code.replace(/<option value="QAI">QAI<\/option>/g, `{(!isAdmin || adminFlight === 'QAI') && <option value="QAI">QAI</option>}`);
code = code.replace(/<option value="ATCT">ATCT<\/option>/g, `{(!isAdmin || adminFlight === 'ATCT') && <option value="ATCT">ATCT</option>}`);
code = code.replace(/<option value="Logistics">Logistics<\/option>/g, `{(!isAdmin || adminFlight === 'Logistics') && <option value="Logistics">Logistics</option>}`);

fs.writeFileSync('src/components/AssignDutyModal.tsx', code);
