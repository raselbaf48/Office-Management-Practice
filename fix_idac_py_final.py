import re

with open('backup_idac.tsx', 'r') as f:
    code = f.read()

# 1. Update activeTab type
code = code.replace(
    "useState<'CONTACTS' | 'SHIFT_TIMES' | 'RESPONSIBILITIES'>('CONTACTS');",
    "useState<'CONTACTS' | 'SHIFT_TIMES' | 'RESPONSIBILITIES' | null>('CONTACTS');"
)

# 2. Remove Tab switcher
code = re.sub(
    r'\{\/\* Tab switcher \*\/\}[\s\S]*?\{\/\* Toast Banner \*\/\}',
    '{/* Toast Banner */}',
    code
)

# 3. Contacts start
code = re.sub(
    r'\{\/\* Content Body \*\/\}\s*<div className="p-6 max-h-\[62vh\] overflow-y-auto space-y-4">\s*\{activeTab === \'CONTACTS\' \? \(\s*<div className="space-y-4">',
    '''{/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[62vh] overflow-y-auto space-y-3">
          
          {/* Section 1: Emergency Contacts */}
          <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeTab === 'CONTACTS'
              ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'CONTACTS' ? null : 'CONTACTS')}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  activeTab === 'CONTACTS' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Emergency Contacts</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                      {contacts.length} Selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Manage personnel shown in Emergency Contacts list</p>
                </div>
              </div>
              <div className={`p-1.5 rounded-full transition-transform duration-200 ${activeTab === 'CONTACTS' ? 'rotate-180 bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
            </button>
            {activeTab === 'CONTACTS' && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn space-y-4">''',
    code
)

# 4. Contacts end -> Shift Times start
code = re.sub(
    r'\s*<\/div>\s*<\/div>\s*<\/div>\s*\) : activeTab === \'SHIFT_TIMES\' \? \(\s*\/\* SHIFT TIME MANAGEMENT TAB \*\/\s*<div className="space-y-4">',
    '''
              </div>
            </div>
            </div>
            )}
          </div>

          {/* Section 2: Shift Time Management */}
          <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeTab === 'SHIFT_TIMES'
              ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'SHIFT_TIMES' ? null : 'SHIFT_TIMES')}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  activeTab === 'SHIFT_TIMES' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Shift Time Management</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Configure start and end times for all 3 shifts</p>
                </div>
              </div>
              <div className={`p-1.5 rounded-full transition-transform duration-200 ${activeTab === 'SHIFT_TIMES' ? 'rotate-180 bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
            </button>
            {activeTab === 'SHIFT_TIMES' && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn space-y-4">''',
    code
)

# 5. Shift Times end -> Responsibilities start
code = re.sub(
    r'\s*<\/div>\s*<\/div>\s*\) : \(\s*\/\* RESPONSIBILITIES TAB \*\/\s*<div className="space-y-4">',
    '''
              </div>
            </div>
            )}
          </div>

          {/* Section 3: Duty Responsibilities */}
          <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            activeTab === 'RESPONSIBILITIES'
              ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'RESPONSIBILITIES' ? null : 'RESPONSIBILITIES')}
              className="w-full p-4 flex items-center justify-between text-left cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl transition-colors ${
                  activeTab === 'RESPONSIBILITIES' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Duty Responsibilities</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {responsibilities.length} Rules
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Manage checklist of duties and orders for IDAC personnel</p>
                </div>
              </div>
              <div className={`p-1.5 rounded-full transition-transform duration-200 ${activeTab === 'RESPONSIBILITIES' ? 'rotate-180 bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
            </button>
            {activeTab === 'RESPONSIBILITIES' && (
              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn space-y-4">''',
    code
)

# 6. End
code = re.sub(
    r'\s*<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\{\/\* Footer \*\/\}',
    '''
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Footer */}''',
    code
)

if 'ChevronDown' not in code:
    code = re.sub(r'import \{([\s\S]*?)\} from \'lucide-react\';', r"import { ChevronDown, BookOpen, \1 } from 'lucide-react';", code)

with open('src/components/IdacSettingsModal.tsx', 'w') as f:
    f.write(code)

