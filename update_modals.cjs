const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/PrintableNightCountModal.tsx'
];

const stateHooksBlock = `
  const [savedDisposals, setSavedDisposals] = useState<Array<{code: string, label: string, customTitle?: string}>>(() => {
    try {
      const saved = localStorage.getItem('savedDisposalKeys');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showDisposalDropdown, setShowDisposalDropdown] = useState(false);

  const ALL_DISPOSAL_OPTIONS = [
    { code: 'TDY', label: 'Det/ Tdy' },
    { code: 'LEAVE', label: 'Leave' },
    { code: 'ESSN', label: 'Essn' },
    { code: 'OTHERS', customTitle: 'Course', label: 'Course' },
    { code: 'CLASS_TRG', label: 'Class/Exam / Trg' },
    { code: 'ABSENT', label: 'AWOL/ Detention' },
    { code: 'SICK_REPORT', label: 'Sick report' },
    { code: 'ED', label: 'ED/ EX PPGF' },
    { code: 'CMH', label: 'CMH/BNS/BSH/Qnt' },
    { code: 'OTHERS', customTitle: 'U/C, U/Board', label: 'U/C, U/Board' },
    { code: 'OTHERS', customTitle: 'Office Duty', label: 'Office Duty' },
    { code: 'OTHERS', customTitle: 'Aft/ Ni flg/ Ni Duty', label: 'Aft/ Ni flg/ Ni Duty' },
    { code: 'AIRPORT', label: 'GD/TF/Airfield Duty' },
    { code: 'DUTY_OFF', label: 'Off Duty' },
    { code: 'RECEPTION', label: 'K/O & Reception' },
    { code: 'CANTEEN', label: 'Mess/ Canteen / Bakery' },
    { code: 'OTHERS', customTitle: 'Driving', label: 'Driving' },
    { code: 'GAMES', label: 'Games / Guard of Honor' },
    { code: 'BAKE_N_BITE', label: 'Bake & Bite' },
    { code: 'ADMIN_ORDER', label: 'Admin Order' },
    { code: 'OTHERS', label: '✨ Custom...' }
  ];

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
      localStorage.setItem('savedDisposalKeys', JSON.stringify(updated));
    }
    setDisposalCategory(opt.code);
    if (opt.customTitle) setDisposalCustomTitle(opt.customTitle);
    setShowDisposalDropdown(false);
  };
`;

const categorySelectUI = `
              {/* 2. Select Disposal Category */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2. Select Disposal Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {savedDisposals.map((cat) => {
                    const isSelected = disposalCategory === cat.code && (cat.code !== 'OTHERS' || disposalCustomTitle === cat.customTitle);
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => {
                          setDisposalCategory(cat.code);
                          if (cat.customTitle) setDisposalCustomTitle(cat.customTitle);
                        }}
                        className={\`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all truncate cursor-pointer \${
                          isSelected
                            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }\`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
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
                </div>

                {/* Custom Title Input if OTHERS selected */}
                {disposalCategory === 'OTHERS' && (!ALL_DISPOSAL_OPTIONS.find(o => o.label === disposalCustomTitle) || disposalCustomTitle === '') && (
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

const dateSelectUI = `
              {/* 1. Date Selection */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  1. Select Date
                </label>
                <div>
                  <DateNavigator
                    value={disposalFromDate}
                    onChange={(e) => {
                      setDisposalFromDate(e.target.value);
                      setDisposalToDate(e.target.value);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500 shadow-xs"
                    required
                  />
                </div>
              </div>
`;

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');

    // 1. Initialize state hook default to empty string
    content = content.replace(/useState<string>\('ESSN'\)/g, "useState<string>('')");

    // 2. Add validation check for empty disposalCategory
    content = content.replace(/!disposalFromDate \|\| !disposalToDate\) return;/g, "!disposalFromDate || !disposalToDate || !disposalCategory) return;");

    // 3. Inject new hooks after disposalSuccessMsg
    if (!content.includes('savedDisposalKeys')) {
      const injectionPoint = 'const [disposalSuccessMsg, setDisposalSuccessMsg] = useState<string>(\'\');';
      content = content.replace(injectionPoint, injectionPoint + '\n' + stateHooksBlock);
    }

    // 4. Replace Date Selection UI completely
    const dateStartRegex = /\{\/\* 1\. Date Selection[\s\S]*?(?=\{\/\* 2\. Select Disposal Category \*\/)/;
    content = content.replace(dateStartRegex, dateSelectUI + '\n');

    // 5. Replace Category UI completely
    const catStartRegex = /\{\/\* 2\. Select Disposal Category \*\/\}[\s\S]*?(?=\{\/\* 3\. Flight Filter)/;
    content = content.replace(catStartRegex, categorySelectUI + '\n');

    fs.writeFileSync(file, content, 'utf-8');
    console.log("Updated " + file);
  }
});

