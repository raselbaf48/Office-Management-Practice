const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add isEditingDisposals state
code = code.replace(
  "const [showCustomInput, setShowCustomInput] = useState(false);",
  "const [showCustomInput, setShowCustomInput] = useState(false);\n  const [isEditingDisposals, setIsEditingDisposals] = useState(false);"
);

// 2. Add 'Total Strength' to default options
code = code.replace(
  "const ALL_DISPOSAL_OPTIONS = [",
  "const ALL_DISPOSAL_OPTIONS = [\n  'Total Strength',"
);

// 3. Update localStorage default
code = code.replace(
  "return saved ? JSON.parse(saved) : [];",
  "return saved ? JSON.parse(saved) : ['Total Strength'];"
);
code = code.replace(
  "} catch { return []; }",
  "} catch { return ['Total Strength']; }"
);

// 4. Update the sync logic to handle Total Strength
code = code.replace(
  /const vals: Record<string, number> = {};\s+if \(existing\) {/g,
  `const vals: Record<string, number> = {};
      if (existing) {
        vals['Total Strength'] = existing.totalStr || 0;`
);

// 5. Update submission logic for Total Strength
code = code.replace(
  /let newDetTdy = 0;/g,
  "let newDetTdy = 0;\n        let newTotalStr = 0;"
);

code = code.replace(
  /if \(k === 'Det\/Tdy'\) newDetTdy = val;/g,
  "if (k === 'Total Strength') newTotalStr = val;\n            else if (k === 'Det/Tdy') newDetTdy = val;"
);

code = code.replace(
  /totalStr: formTotalStr,/g,
  "totalStr: newTotalStr,"
);

// 6. UI Changes: Remove `formTotalStr` state completely
code = code.replace(
  "const [formTotalStr, setFormTotalStr] = useState<number>(0);\n",
  ""
);
code = code.replace(
  "setFormTotalStr(existing\\?\\.totalStr || 0);\n",
  ""
);

// 7. Remove Total Strength UI input block
const totalStrBlock = `                  {/* Total Strength */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 mb-1">Total Strength</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={formTotalStr || ''} 
                      onChange={e => setFormTotalStr(parseInt(e.target.value)||0)} 
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-emerald-500 font-bold" 
                    />
                  </div>`;
code = code.replace(totalStrBlock, "");

// 8. Add settings button to "2. Add Disposals"
const addDisposalsTitle = `                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-3">
                      2. Add Disposals
                    </label>`;
const newDisposalsTitle = `                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        2. Counts & Disposals
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsEditingDisposals(!isEditingDisposals)}
                        className={\`p-1 rounded-md transition-colors cursor-pointer \${isEditingDisposals ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}\`}
                        title="Manage Categories"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>`;
code = code.replace(addDisposalsTitle, newDisposalsTitle);

// 9. Hide X button if not editing
const xButton = `<button
                            type="button"
                            onClick={() => handleRemoveDisposalFromForm(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Remove category from form"
                          >
                            <X className="w-4 h-4" />
                          </button>`;
const newXButton = `{isEditingDisposals && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDisposalFromForm(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="Remove category from form"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          )}`;
code = code.replace(xButton, newXButton);

// Also need to remove the top border from the disposals section since it's the only section now
code = code.replace(
  '<div className="border-t border-slate-200 dark:border-slate-800 pt-4">',
  '<div>'
);

fs.writeFileSync(path, code);
