import os
import re

file_path = 'src/components/AddEditAirmanModal.tsx'
with open(file_path, 'r') as f:
    code = f.read()

# Remove isCustomTrade state
code = re.sub(r'const \[isCustomTrade, setIsCustomTrade\] = useState\(false\);\n', '', code)

# Replace the Trade block
old_trade_block = """            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Trade <span className="text-red-500">*</span></span>
              </label>
              {isCustomTrade ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={trade}
                    onChange={(e) => {
                      setTrade(e.target.value);
                      if (validationError) setValidationError('');
                    }}
                    placeholder="Enter Custom Trade"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button type="button" onClick={() => setIsCustomTrade(false)} className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-bold">X</button>
                </div>
              ) : (
                <select
                  value={['Afr Fitt', 'Eng Fitt', 'E&I Fitt', 'Radio Fitt', 'Armt Fitt', 'GS', 'Log Asst', 'Sec Asst (GD)', 'Sec Asst (Accts)', 'Admin Asst'].includes(trade) ? trade : trade === '' ? '' : 'Custom'}
                  required
                  onChange={(e) => {
                    if (e.target.value === 'Custom') {
                      setIsCustomTrade(true);
                      setTrade('');
                    } else {
                      setTrade(e.target.value);
                    }
                    if (validationError) setValidationError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="" disabled>Select Trade</option>
                  {['Afr Fitt', 'Eng Fitt', 'E&I Fitt', 'Radio Fitt', 'Armt Fitt', 'GS', 'Log Asst', 'Sec Asst (GD)', 'Sec Asst (Accts)', 'Admin Asst'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="Custom">Custom...</option>
                </select>
              )}
            </div>"""

new_trade_block = """            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                list="trade-options"
                value={trade}
                required
                onChange={(e) => {
                  setTrade(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Select or type Trade"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="trade-options">
                {['Afr Fitt', 'Eng Fitt', 'E&I Fitt', 'Radio Fitt', 'Armt Fitt', 'GS', 'Log Asst', 'Sec Asst (GD)', 'Sec Asst (Accts)', 'Admin Asst', 'ATCA'].map(t => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>"""

code = code.replace(old_trade_block, new_trade_block)

with open(file_path, 'w') as f:
    f.write(code)

print("Trade block updated.")
