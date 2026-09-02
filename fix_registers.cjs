const fs = require('fs');

function patchRegister(filename) {
  let code = fs.readFileSync(filename, 'utf8');

  if (!code.includes('getCurrentUserSession')) {
    code = code.replace(/import \{ Airman, FlightName, UserRole \} from '\.\.\/types';/, 
      "import { Airman, FlightName, UserRole } from '../types';\nimport { getCurrentUserSession } from '../utils/authSession';");
  }

  // Find the component definition
  const componentRegex = /const \[selectedFlight, setSelectedFlight\] = useState<FlightName \| 'All'>\('All'\);/;
  if (code.match(componentRegex) && !code.includes('const session = getCurrentUserSession();')) {
    code = code.replace(componentRegex, `const session = getCurrentUserSession();
  const isAdmin = session?.assignedRole === 'ADMIN';
  const adminFlight = session?.flightName;
  const [selectedFlight, setSelectedFlight] = useState<FlightName | 'All'>(isAdmin && adminFlight ? adminFlight : 'All');`);
  }

  // Filter Pill buttons
  // Look for: {(['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as (FlightName | 'All')[]).map((fl) => (
  // <button key={fl} onClick={() => setSelectedFlight(fl)} ... className={`...`}
  if (code.includes("(['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as (FlightName | 'All')[]).map((fl) => (")) {
    code = code.replace(/\{\(\['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'\] as \(FlightName \| 'All'\)\[\]\)\.map\(\(fl\) => \(\s*<button([\s\S]*?)<\/button>\s*\)\)\}/m, 
    `{(['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'] as (FlightName | 'All')[]).map((fl) => {
            const isDisabledFlt = isAdmin && adminFlight && fl !== adminFlight;
            return (
            <button
              key={fl}
              onClick={() => !isDisabledFlt && setSelectedFlight(fl)}
              disabled={isDisabledFlt}
              className={\`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 \${
                isDisabledFlt ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600' :
                selectedFlight === fl
                  ? 'bg-emerald-600 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer'
              }\`}
            >
              {fl === 'All' ? 'All Flights (48)' : \`\${fl} Flight\`}
            </button>
            );
          })}`);
  }

  // Modal Pill Buttons
  // Look for: {(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((flt) => (
  if (code.includes("(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((flt) => (")) {
    // Note: state setter name might vary (setGrantTdyFlight, setGrantLeaveFlight, setGrantDepFlight)
    code = code.replace(/\{\(\['Avionics', 'Mechanics', 'GCS', 'Admin'\] as FlightName\[\]\)\.map\(\(flt\) => \(\s*<button([\s\S]*?)onClick=\{\(\) => set(.*?)Flight\(flt\)\}([\s\S]*?)<\/button>\s*\)\)\}/m, 
    (match, p1, setterInner, p2) => {
        return `{(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((flt) => {
                    const isDisabledFlt = isAdmin && adminFlight && flt !== adminFlight;
                    const setterStateValue = grant${setterInner}Flight === flt; // This is a bit hacky, let's just do an exact replace depending on the file
                    return (
                    <button
                      key={flt}
                      type="button"
                      onClick={() => !isDisabledFlt && set${setterInner}Flight(flt)}
                      disabled={isDisabledFlt}
                      className={\`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all \${
                        isDisabledFlt ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700' :
                        grant${setterInner}Flight === flt
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs cursor-pointer'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 cursor-pointer'
                      }\`}
                    >
                      {flt}
                    </button>
                    );
                  })}`;
    });
  }

  fs.writeFileSync(filename, code);
}

patchRegister('src/components/TdyRegisterView.tsx');
patchRegister('src/components/LeaveRegisterView.tsx');
patchRegister('src/components/DeploymentRegisterView.tsx');

