const fs = require('fs');

const PARADE_OPTIONS = [
  { code: 'TDY', label: 'Det/ Tdy' },
  { code: 'LEAVE', label: 'Leave' },
  { code: 'ESSN', label: 'Essn' },
  { code: 'CMH', label: 'BNS/BSH/ CMH' },
  { code: 'SICK_REPORT', label: 'Sick Report' },
  { code: 'CANTEEN', label: 'Canteen' },
  { code: 'DUTY_OFF', label: 'Guard Duty On/Off' },
  { code: 'BAKE_N_BITE', label: 'Bake & Bite' },
  { code: 'RECEPTION', label: 'K/O & Reception' },
  { code: 'ADMIN_ORDER', label: 'Admin Order' },
  { code: 'CLASS_TRG', label: 'Class/ Trg' },
  { code: 'AIRPORT', label: 'Airfield Duty' },
  { code: 'GAMES', label: 'G/H & Games' },
  { code: 'ABSENT', label: 'Absent' },
  { code: 'OTHERS', label: '✨ Custom...' }
];

const NIGHT_COUNT_OPTIONS = [
  { code: 'TDY', label: 'Det/Tdy' },
  { code: 'LEAVE', label: 'Leave' },
  { code: 'OTHERS', customTitle: 'Course', label: 'Course' },
  { code: 'CLASS_TRG', label: 'Class/Exam' },
  { code: 'ABSENT', label: 'AWOL/Detention' },
  { code: 'SICK_REPORT', label: 'Sick report' },
  { code: 'ED', label: 'ED/ EX PPGF' },
  { code: 'CMH', label: 'CMH/BNS/BSH/Qnt' },
  { code: 'OTHERS', customTitle: 'U/C, U/Board', label: 'U/C, U/ Board' },
  { code: 'OTHERS', customTitle: 'Office Duty', label: 'Office Duty' },
  { code: 'OTHERS', customTitle: 'Aft/ Ni flg/ Ni Duty', label: 'Aft/ Ni flg/ Ni Duty' },
  { code: 'AIRPORT', label: 'GD/TF/Airfield Duty' },
  { code: 'DUTY_OFF', label: 'Off Duty' },
  { code: 'RECEPTION', label: 'K/O' },
  { code: 'CANTEEN', label: 'Mess/ Canteen / Bakery' },
  { code: 'OTHERS', customTitle: 'Driving', label: 'Driving' },
  { code: 'GAMES', label: 'Games / Guard of Honor' },
  { code: 'OTHERS', label: '✨ Custom...' }
];

const processFile = (file, isParade) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');

  // Inject Settings icon to lucide-react if not present
  if (!content.includes('Settings')) {
    content = content.replace(/import \{([\s\S]*?)from 'lucide-react';/, "import {$1 Settings,\n} from 'lucide-react';");
  }

  // Replace state hooks block
  const optionsArr = isParade ? JSON.stringify(PARADE_OPTIONS) : JSON.stringify(NIGHT_COUNT_OPTIONS);
  const localStorageKey = isParade ? "'savedDisposalKeys_Parade'" : "'savedDisposalKeys_NC'";
  
  const hooksRegex = /const \[savedDisposals[\s\S]*?setShowDisposalDropdown\(false\);\n  \};/m;
  const newHooks = `
  const [savedDisposals, setSavedDisposals] = useState<Array<{code: string, label: string, customTitle?: string}>>(() => {
    try {
      const saved = localStorage.getItem(${localStorageKey});
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showDisposalDropdown, setShowDisposalDropdown] = useState(false);
  const [isEditingDisposals, setIsEditingDisposals] = useState(false);

  const ALL_DISPOSAL_OPTIONS = ${optionsArr};

  const handleAddDisposalOption = (opt: any) => {
    if (opt.code === 'OTHERS' && !opt.customTitle) {
       setDisposalCategory('OTHERS');
       setDisposalCustomTitle('');
       setShowDisposalDropdown(false);
       return;
    }
    
    const isAlreadyAdded = savedDisposals.some(d => d.label === opt.label);
    if (!isAlreadyAdded) {
      const updated = [...savedDisposals, opt];
      setSavedDisposals(updated);
      localStorage.setItem(${localStorageKey}, JSON.stringify(updated));
    }
    setDisposalCategory(opt.code);
    if (opt.customTitle) setDisposalCustomTitle(opt.customTitle);
    setShowDisposalDropdown(false);
  };

  const handleRemoveDisposalOption = (label: string) => {
    const updated = savedDisposals.filter(d => d.label !== label);
    setSavedDisposals(updated);
    localStorage.setItem(${localStorageKey}, JSON.stringify(updated));
    if (updated.length === 0) setIsEditingDisposals(false);
  };
  `;
  
  if (content.match(hooksRegex)) {
    content = content.replace(hooksRegex, newHooks.trim());
  }

  // Replace category UI
  const categoryUI = `
              {/* 2. Select Disposal Category */}
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    2. Select Disposal Category
                  </label>
                  {savedDisposals.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsEditingDisposals(!isEditingDisposals)}
                      className={\`p-1 rounded-md transition-colors cursor-pointer \${isEditingDisposals ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}\`}
                      title="Manage Saved Categories"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedDisposals.map((cat) => {
                    const isSelected = !isEditingDisposals && disposalCategory === cat.code && (cat.code !== 'OTHERS' || disposalCustomTitle === cat.customTitle);
                    return (
                      <div key={cat.label} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditingDisposals) return;
                            setDisposalCategory(cat.code);
                            if (cat.customTitle) setDisposalCustomTitle(cat.customTitle);
                          }}
                          className={\`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all truncate \${isEditingDisposals ? 'pr-6 opacity-80 cursor-default bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'cursor-pointer'} \${
                            isSelected
                              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-xs'
                              : (!isEditingDisposals ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600' : '')
                          }\`}
                        >
                          {cat.label}
                        </button>
                        {isEditingDisposals && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDisposalOption(cat.label)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {!isEditingDisposals && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDisposalDropdown(!showDisposalDropdown)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-400 bg-slate-50 dark:bg-slate-900 transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {savedDisposals.length === 0 && <span>Add Category</span>}
                      </button>
                      {showDisposalDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1">
                          {ALL_DISPOSAL_OPTIONS.map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => handleAddDisposalOption(opt)}
                              className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Title Input if OTHERS selected */}
                {disposalCategory === 'OTHERS' && (!ALL_DISPOSAL_OPTIONS.find(o => o.label === disposalCustomTitle) || disposalCustomTitle === '') && !isEditingDisposals && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1 animate-fadeIn">
                    <label className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Specify Custom Disposal Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Special Escort, VVIP Detail..."
                      value={disposalCustomTitle}
                      onChange={(e) => setDisposalCustomTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-amber-500 shadow-xs"
                      required
                    />
                  </div>
                )}
              </div>
  `;
  const catRegex = /\{\/\* 2\. Select Disposal Category \*\/\}[\s\S]*?(?=\{\/\* 3\. Flight Filter)/;
  if (content.match(catRegex)) {
    content = content.replace(catRegex, categoryUI.trim() + '\n\n              ');
  }

  // Handle saving custom title automatically on submit
  // Look for: const effectiveScope = isPtDocument ? 'PT' : (disposalScope === 'PT' ? 'PT' : 'PARADE');
  // OR for NightCount: const effectiveScope = 'PARADE'; (wait, let's just use effectiveNotes injection)
  const submitInjection = `
      if (isCustom && effectiveNotes && effectiveNotes !== 'Custom Disposal') {
        setSavedDisposals(prev => {
          const exists = prev.some(d => d.label === effectiveNotes);
          if (!exists) {
            const updated = [...prev, { code: 'OTHERS', customTitle: effectiveNotes, label: effectiveNotes }];
            localStorage.setItem(${localStorageKey}, JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }
`;
  if (content.includes('const effectiveNotes = isCustom ? (disposalCustomTitle.trim() || \'Custom Disposal\') : undefined;')) {
    // Inject right after effectiveNotes definition, but before fetch
    const replaceTarget = "const effectiveNotes = isCustom ? (disposalCustomTitle.trim() || 'Custom Disposal') : undefined;";
    content = content.replace(replaceTarget, replaceTarget + submitInjection);
  }

  fs.writeFileSync(file, content, 'utf-8');
}

processFile('src/components/ParadeStateFormattedView.tsx', true);
processFile('src/components/NightCountStateView.tsx', false);
processFile('src/components/PrintableNightCountModal.tsx', false);
console.log("Updated components for specific options, edit mode, and auto-save");
