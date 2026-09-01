const fs = require('fs');
let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

// Replace Rank select
const rankSelect = `<select
                value={rank}
                required
                onChange={(e) => {
                  setRank(e.target.value as any);
                  if (validationError) setValidationError('');
                }}
                className={\`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer \${!rank ? 'border-amber-400 bg-amber-50/40' : 'border-slate-300 dark:border-slate-700'}\`}
              >
                <option value="" disabled>-- Select Rank --</option>
                {ranksList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>`;

const rankButtons = `<div className="flex flex-wrap gap-1.5">
                {ranksList.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRank(r as any);
                      if (validationError) setValidationError('');
                    }}
                    className={\`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer \${
                      rank === r
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }\`}
                  >
                    {r}
                  </button>
                ))}
              </div>`;

content = content.replace(rankSelect, rankButtons);

// Replace Trade select
const tradeSelect = `<select
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

const tradeButtons = `<div className="flex flex-wrap gap-1.5">
                {['Afr Fitt', 'Eng Fitt', 'E&I Fitt', 'Radio Fitt', 'Armt Fitt', 'GS', 'Log Asst', 'Sec Asst (GD)', 'Sec Asst (Accts)', 'Admin Asst', 'ATCA'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTrade(t);
                      if (validationError) setValidationError('');
                    }}
                    className={\`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer \${
                      trade === t
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                    }\`}
                  >
                    {t}
                  </button>
                ))}
              </div>`;

content = content.replace(tradeSelect, tradeButtons);

// Fix grid-cols-1 sm:grid-cols-2 for Rank & Trade to just be a flex col
content = content.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">',
  '<div className="flex flex-col gap-4">'
);

fs.writeFileSync('src/components/AddEditAirmanModal.tsx', content, 'utf-8');
console.log("Patched Rank and Trade");
