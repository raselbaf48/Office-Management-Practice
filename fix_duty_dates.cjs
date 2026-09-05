const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';

let code = fs.readFileSync(file, 'utf8');

// 1. Replace state definition
code = code.replace(
  "const [dateMode, setDateMode] = useState<'single' | 'multi'>('single');",
  "const [selectedPresetDays, setSelectedPresetDays] = useState<number | null>(1);"
);

// 2. Replace dateMode usages in arrow key logic
code = code.replace(
  "if (dateMode === 'single') {",
  "if (selectedPresetDays === 1) {"
);

code = code.replace(
  "}, [isOpen, dateMode, fromDate]);",
  "}, [isOpen, selectedPresetDays, fromDate]);"
);

// 3. Replace the date buttons
const oldButtonsRegex = /<div className="flex items-center space-x-1 bg-white dark:bg-slate-900 p-0\.5 rounded-lg border border-slate-300 dark:border-slate-700">[\s\S]*?<\/div>/;

const newButtons = `<div className="flex items-center space-x-1.5">
                {[{label: 'Today', val: 1}, {label: '2 Days', val: 2}, {label: '3 Days', val: 3}, {label: '7 Days', val: 7}, {label: '15 Days', val: 15}].map((opt) => {
                  const isSelected = selectedPresetDays === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSelectedPresetDays(opt.val);
                        if (fromDate) {
                          const d = new Date(fromDate);
                          d.setDate(d.getDate() + opt.val - 1);
                          setToDate(d.toISOString().split('T')[0]);
                        }
                      }}
                      className={\`px-2 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer shadow-2xs border \${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/50 shadow-sm'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300'
                      }\`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>`;

code = code.replace(oldButtonsRegex, newButtons);

// 4. Replace rendering logic
code = code.replace(/{dateMode === 'single' && \(/g, "{selectedPresetDays === 1 && (");
code = code.replace(/{dateMode === 'multi' && \(/g, "{selectedPresetDays !== 1 && (");

// 5. Replace logic in fromDate onChange
code = code.replace(
  "if (dateMode === 'single' || !toDate || toDate < val) {",
  "if (selectedPresetDays === 1 || !toDate || toDate < val) {"
);

// We need to also keep `toDate` in sync if selectedPresetDays is set, wait let's just make sure
// the onChange of fromDate in DateNavigator works like in the TDY tab:
const oldOnChange = `onChange={(e) => {
                  const val = e.target.value;
                  setFromDate(val);
                  if (selectedPresetDays === 1 || !toDate || toDate < val) {
                    setToDate(val);
                  }
                }}`;
                
const newOnChange = `onChange={(e) => {
                  const val = e.target.value;
                  setFromDate(val);
                  if (toDate < val) setToDate(val);
                  
                  if (selectedPresetDays === 1) {
                    setToDate(val);
                  } else if (selectedPresetDays !== null) {
                    const d = new Date(val);
                    d.setDate(d.getDate() + selectedPresetDays - 1);
                    setToDate(d.toISOString().split('T')[0]);
                  }
                }}`;

code = code.replace(oldOnChange, newOnChange);

// Update DateNavigator for toDate so it resets selectedPresetDays
const oldToDateOnChange = `onChange={(e) => setToDate(e.target.value)}`;
const newToDateOnChange = `onChange={(e) => {
                      setToDate(e.target.value);
                      setSelectedPresetDays(null);
                    }}`;
                    
code = code.replace(oldToDateOnChange, newToDateOnChange);


// 6. Replace footer logic
code = code.replace(
  "{dateMode === 'multi' && fromDate !== toDate ? ` to ${toDate}` : ''}",
  "{selectedPresetDays !== 1 && fromDate !== toDate ? ` to ${toDate}` : ''}"
);

fs.writeFileSync(file, code);
console.log('Fixed AssignDutyModal.tsx');
