const fs = require('fs');
let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

const oldTrade = `<input
                type="text"
                list="trade-options"
                value={trade}
                required
                onChange={(e) => {
                  setTrade(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Select or type Trade"
                className={\`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none \${!trade ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 dark:border-slate-700'}\`}
              />
              <datalist id="trade-options">
                {['Afr Fitt', 'Eng Fitt', 'E&I Fitt', 'Radio Fitt', 'Armt Fitt', 'GS', 'Log Asst', 'Sec Asst (GD)', 'Sec Asst (Accts)', 'Admin Asst', 'ATCA'].map(t => (
                  <option key={t} value={t} />
                ))}
              </datalist>`;

const newTrade = `<select
                value={trade}
                required
                onChange={(e) => {
                  setTrade(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className={\`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer \${!trade ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 dark:border-slate-700'}\`}
              >
                <option value="" disabled>-- Select Trade --</option>
                {['Afr Fitt', 'Eng Fitt', 'E&I Fitt', 'Radio Fitt', 'Armt Fitt', 'GS', 'Log Asst', 'Sec Asst (GD)', 'Sec Asst (Accts)', 'Admin Asst', 'ATCA'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>`;

if (content.includes('list="trade-options"')) {
  // It's a bit hard to string replace exactly. Let's use regex
  content = content.replace(/<input[\s\S]*?list="trade-options"[\s\S]*?<\/datalist>/, newTrade);
  fs.writeFileSync('src/components/AddEditAirmanModal.tsx', content, 'utf-8');
  console.log('Trade converted to select');
} else {
  console.log('Could not find old trade input');
}

