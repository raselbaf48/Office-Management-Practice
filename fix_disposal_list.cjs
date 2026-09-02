const fs = require('fs');

function patchDisposal(filename) {
  let code = fs.readFileSync(filename, 'utf8');

  // Find the exact line "return (" after handleDeselectFlight
  const regex = /const handleDeselectFlight = \(\) => \{[\s\S]*?\};\s*return \(/;

  if (code.match(regex)) {
     code = code.replace(regex, `const handleDeselectFlight = () => {
                    const flightIds = flightAirmen.map((a) => a.id);
                    setSelectedDisposalAirmenIds((prev) => prev.filter((id) => !flightIds.includes(id)));
                  };
                  
                  if (role === 'ADMIN' && selectedDate < todayStr) {
                    return (
                      <div className="py-8 text-center text-sm font-bold text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="mb-2">🚫</div>
                        Modifications are disabled for past dates.
                      </div>
                    );
                  }

                  return (`);
  }

  fs.writeFileSync(filename, code);
}

patchDisposal('src/components/ParadeStateFormattedView.tsx');
patchDisposal('src/components/NightCountStateView.tsx');
patchDisposal('src/components/PrintableParadeStateModal.tsx');
patchDisposal('src/components/PrintableNightCountModal.tsx');
