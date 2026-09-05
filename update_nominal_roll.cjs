const fs = require('fs');

function updateNominalRoll() {
  let file = 'src/components/NominalRoll.tsx';
  let code = fs.readFileSync(file, 'utf8');

  // Add AlertTriangle icon import if not there
  if (!code.includes('AlertTriangle')) {
    code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, AlertTriangle } from 'lucide-react';");
  }

  // Update name cell
  code = code.replace(
    /<span className="font-black text-slate-900 dark:text-slate-100 text-left">\s*\{airman.name\}\s*<\/span>/,
    `<div className="flex items-center space-x-2">
                      <span className="font-black text-slate-900 dark:text-slate-100 text-left">
                        {airman.name}
                      </span>
                      {(!airman.bdNo || !airman.rank || !airman.name || !airman.trade || !airman.addressBlock || !airman.mobileNo || !airman.flightName) && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Missing information. Click to update." />
                      )}
                    </div>`
  );

  fs.writeFileSync(file, code);
}
updateNominalRoll();
console.log('Updated NominalRoll');
