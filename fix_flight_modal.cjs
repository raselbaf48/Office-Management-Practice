const fs = require('fs');
let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

content = content.replace(
  /<select[\s\n]*value=\{flightName\}[\s\n]*onChange=\{\(e\) => setFlightName\(e\.target\.value as FlightName\)\}[\s\n]*className="w-full px-3\.5 py-2\.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"[\s\n]*>/,
  `<select
                value={flightName}
                required
                onChange={(e) => {
                  setFlightName(e.target.value as any);
                  if (validationError) setValidationError('');
                }}
                className={\`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer \${!flightName ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 dark:border-slate-700'}\`}
              >`
);

fs.writeFileSync('src/components/AddEditAirmanModal.tsx', content, 'utf-8');
