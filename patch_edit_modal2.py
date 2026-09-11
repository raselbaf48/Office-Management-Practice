import re

files = [
  'src/components/NightCountStateView.tsx',
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/PrintableNightCountModal.tsx',
  'src/components/PrintableParadeStateModal.tsx'
]

replacement = """{/* Change Category Selection */}
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Change Disposal Category To:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditingDisposals(!isEditingDisposals)}
                    className={`p-1 rounded-md transition-colors cursor-pointer ${isEditingDisposals ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    title="Manage Saved Categories"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedDisposals.map((cat) => {
                    const isSelected = !isEditingDisposals && editDisposalCategory === cat.code && (cat.code !== 'OTHERS' || editDisposalCustomTitle === cat.customTitle);
                    return (
                      <div key={cat.label} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditingDisposals) return;
                            setEditDisposalCategory(cat.code);
                            if (cat.customTitle) setEditDisposalCustomTitle(cat.customTitle);
                            else if (cat.code === 'OTHERS') setEditDisposalCustomTitle('');
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all truncate ${isEditingDisposals ? 'pr-6 opacity-80 cursor-default bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'cursor-pointer'} ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-xs'
                              : (!isEditingDisposals ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600' : '')
                          }`}
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
                        <div className="absolute bottom-full mb-1 left-0 w-56 max-h-64 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1">
                          {[...ALL_DISPOSAL_OPTIONS, ...historicalCustomCats].filter(opt => opt.code === 'OTHERS' || (!savedDisposals.some(d => d.code === opt.code && (d.code !== 'OTHERS' || d.customTitle === opt.customTitle)))).filter((opt, index, self) => index === self.findIndex((t) => t.code === opt.code && t.customTitle === opt.customTitle)).map((opt) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => {
                                handleAddDisposalOption(opt);
                                setEditDisposalCategory(opt.code);
                                if (opt.customTitle) setEditDisposalCustomTitle(opt.customTitle);
                                else if (opt.code === 'OTHERS') setEditDisposalCustomTitle('');
                                setShowDisposalDropdown(false);
                              }}
                              className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-900 dark:hover:text-emerald-100 transition-colors"
                            >
                              {opt.code === 'OTHERS' && opt.customTitle ? opt.customTitle : opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Custom Title Input if OTHERS selected */}
                {editDisposalCategory === 'OTHERS' && (!ALL_DISPOSAL_OPTIONS.find(o => o.label === editDisposalCustomTitle) || editDisposalCustomTitle === '') && !isEditingDisposals && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1 animate-fadeIn mt-2">
                    <label className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Specify Custom Disposal Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Special Escort, VVIP Detail..."
                      value={editDisposalCustomTitle}
                      onChange={(e) => setEditDisposalCustomTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white print:text-black outline-none focus:border-amber-500 shadow-xs"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Modal Action Buttons */}"""

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r'\{\/\*\s*Change Category Selection\s*\*\/\}.*?\{\/\*\s*Modal Action Buttons\s*\*\/\}'
    
    new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)
    
    if count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"Failed to match in {file_path}")
