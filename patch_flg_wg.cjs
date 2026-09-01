const fs = require('fs');

let content = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

const unitSelect = `<select 
                  required
                  value={addForm.unit}
                  onChange={(e) => {
                    const selectedUnit = e.target.value;
                    const existing = displayData.find(d => d.unit === selectedUnit);
                    setAddForm({
                      unit: selectedUnit,
                      totalStr: existing?.totalStr || 0,
                      detTdy: existing?.detTdy || 0,
                      leave: existing?.leave || 0,
                      edExPpgf: existing?.edExPpgf || 0,
                      cmhBnsBsh: existing?.cmhBnsBsh || 0,
                      officeDuty: existing?.officeDuty || 0,
                      baseAirfieldDuty: existing?.baseAirfieldDuty || 0,
                      driving: existing?.driving || 0,
                    });
                  }}
                  className={\`w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 \${!addForm.unit ? 'border-amber-400 bg-amber-50/40 text-amber-900 dark:text-amber-100' : 'border-slate-200 dark:border-slate-700'}\`}
                >
                  <option value="" disabled>Select Unit</option>
                  {FLYING_WING_UNITS.filter(u => u !== '155 UASU BAF').map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>`;

const unitButtons = `<div className="flex flex-wrap gap-1.5">
                  {FLYING_WING_UNITS.filter(u => u !== '155 UASU BAF').map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => {
                        const selectedUnit = u;
                        const existing = displayData.find(d => d.unit === selectedUnit);
                        setAddForm({
                          unit: selectedUnit,
                          totalStr: existing?.totalStr || 0,
                          detTdy: existing?.detTdy || 0,
                          leave: existing?.leave || 0,
                          edExPpgf: existing?.edExPpgf || 0,
                          cmhBnsBsh: existing?.cmhBnsBsh || 0,
                          officeDuty: existing?.officeDuty || 0,
                          baseAirfieldDuty: existing?.baseAirfieldDuty || 0,
                          driving: existing?.driving || 0,
                        });
                      }}
                      className={\`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer \${
                        addForm.unit === u
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }\`}
                    >
                      {u}
                    </button>
                  ))}
                </div>`;

content = content.replace(unitSelect, unitButtons);
fs.writeFileSync('src/components/FlyingWingStateView.tsx', content, 'utf-8');
console.log("Patched Flg Wg Unit Selection");
