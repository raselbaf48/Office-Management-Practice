const fs = require('fs');
let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

// Rank
content = content.replace(
  /className="w-full px-3\.5 py-2\.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"/,
  "className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer ${!rank ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 dark:border-slate-700'}`}"
);

// Trade
content = content.replace(
  /className="w-full px-3\.5 py-2\.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"/,
  "className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none ${!trade ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 dark:border-slate-700'}`}"
);

// Flight Name
content = content.replace(
  /<select\s*value=\{flightName\}\s*required\s*onChange=\{\(e\) => \{\s*setFlightName\(e\.target\.value as FlightName\);\s*if \(validationError\) setValidationError\(''\);\s*\}\}\s*className="w-full px-3\.5 py-2\.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"/,
  `<select
                value={flightName}
                required
                onChange={(e) => {
                  setFlightName(e.target.value as FlightName);
                  if (validationError) setValidationError('');
                }}
                className={\`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer \${!flightName ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 dark:border-slate-700'}\`}`
);

fs.writeFileSync('src/components/AddEditAirmanModal.tsx', content, 'utf-8');
console.log('Patched styling of inputs');
