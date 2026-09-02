const fs = require('fs');

function patchDisposalModal(filename) {
  let code = fs.readFileSync(filename, 'utf8');

  // Search for the Add Disposal flight selector
  const regex = /\{\(\['Avionics', 'Mechanics', 'GCS', 'Admin'\] as FlightName\[\]\)\.map\(\(fl\) => \(\s*<button([\s\S]*?)onClick=\{\(\) => setDisposalFlight\(fl\)\}([\s\S]*?)<\/button>\s*\)\)\}/m;

  if (code.match(regex)) {
    code = code.replace(regex, `{(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((fl) => {
                    const isDisabledFlt = (role === 'ADMIN' && userFlight && fl !== userFlight) || (role === 'ADMIN' && selectedDate < todayStr);
                    return (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => !isDisabledFlt && setDisposalFlight(fl)}
                      disabled={isDisabledFlt}
                      className={\`py-1 px-2 text-xs font-bold rounded-lg border text-center transition-all \${
                        isDisabledFlt ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-600 dark:border-slate-700' :
                        disposalFlight === fl
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs cursor-pointer'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400 cursor-pointer'
                      }\`}
                    >
                      {fl}
                    </button>
                    );
                  })}`);
  }
  
  // ensure todayStr is defined at top of component if not already
  if (!code.includes('const todayStr = new Date().toISOString().split')) {
    code = code.replace(/(const \[showAddDisposalModal, setShowAddDisposalModal\] = useState<boolean>\(false\);)/, "const todayStr = new Date().toISOString().split('T')[0];\n  $1");
  }

  // Also replace initial state to default to userFlight if admin
  code = code.replace(/const \[disposalFlight, setDisposalFlight\] = useState<FlightName>\('Avionics'\);/g, "const [disposalFlight, setDisposalFlight] = useState<FlightName>(role === 'ADMIN' && userFlight ? userFlight as FlightName : 'Avionics');");

  fs.writeFileSync(filename, code);
}

patchDisposalModal('src/components/ParadeStateFormattedView.tsx');
patchDisposalModal('src/components/PrintableParadeStateModal.tsx');
patchDisposalModal('src/components/NightCountStateView.tsx');
patchDisposalModal('src/components/PrintableNightCountModal.tsx');
