const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

const selectBlock = `                                <select
                                  value={['Orderly Room', 'UWO', 'TDY', 'Deployment (Bake & Bite)', 'Deployment (Canteen)', '-'].includes(currentVal) ? currentVal : (currentVal && currentVal !== '-' ? 'Custom' : '-')}
                                  onChange={(e) => handleDisposalSelect(e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                                >
                                  <option value="-">-</option>
                                  <option value="Orderly Room">Orderly Room</option>
                                  <option value="UWO">UWO</option>
                                  <option value="TDY">TDY</option>
                                  <option value="Deployment (Bake & Bite)">Deployment (Bake & Bite)</option>
                                  <option value="Deployment (Canteen)">Deployment (Canteen)</option>
                                  {!['Orderly Room', 'UWO', 'TDY', 'Deployment (Bake & Bite)', 'Deployment (Canteen)', '-'].includes(currentVal) && currentVal && (
                                     <option value={currentVal}>{currentVal}</option>
                                  )}
                                  <option value="Custom">Custom...</option>
                                </select>`;

const inputDatalist = `                                <input
                                  type="text"
                                  list="disposal-options"
                                  value={currentVal}
                                  onChange={(e) => setDisposals({ ...disposals, [a.id]: e.target.value })}
                                  className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                                  placeholder="Select or type..."
                                />`;

code = code.replace(selectBlock, inputDatalist);

// We also need to add the datalist somewhere in the component (outside the loop)
const endRender = `                    </table>`;
const endRenderWithDatalist = `                    </table>
                    <datalist id="disposal-options">
                      <option value="-">-</option>
                      <option value="Orderly Room" />
                      <option value="UWO" />
                      <option value="TDY" />
                      <option value="Deployment (Bake & Bite)" />
                      <option value="Deployment (Canteen)" />
                    </datalist>`;
                    
code = code.replace(endRender, endRenderWithDatalist);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
