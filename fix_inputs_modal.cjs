const fs = require('fs');
let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

const correctInputs = `          {/* Name & BD No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Airman Name"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                BD No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={bdNo}
                onChange={(e) => {
                  setBdNo(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="478546"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Rank & Trade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rank <span className="text-red-500">*</span>
              </label>
              <select
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
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trade <span className="text-red-500">*</span>
              </label>
              <select
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
              </select>
            </div>
          </div>`;

content = content.replace(/\{\/\* Name & BD No \*\/\}[\s\S]*?\{\/\* Flight & Mobile \*\/\}/, correctInputs + '\n\n          {/* Flight & Mobile */}');

fs.writeFileSync('src/components/AddEditAirmanModal.tsx', content, 'utf-8');
