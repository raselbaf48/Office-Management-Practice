import fs from 'fs';

const path = 'src/components/SettingsModal.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add state for mobileView
code = code.replace(
  /const \[activeSection, setActiveSection\] = useState<SettingSection \| null>\(null\);/,
  "const [activeSection, setActiveSection] = useState<SettingSection | null>(null);\n  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');"
);

// 2. Change Left Column classes
code = code.replace(
  /<div className="w-full sm:w-\[30%\] sm:max-w-\[320px\] bg-slate-50 dark:bg-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">/,
  "<div className={`w-full sm:w-[30%] sm:max-w-[320px] bg-slate-50 dark:bg-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 ${mobileView === 'detail' ? 'hidden sm:flex' : 'flex'}`}>"
);

// 3. Update tab click handler
code = code.replace(
  /setActiveSection\(sec\.id as SettingSection\);/g,
  "setActiveSection(sec.id as SettingSection);\n                    setMobileView('detail');"
);

// 4. Update Right Column classes
code = code.replace(
  /<div className="flex-1 bg-white dark:bg-\[#1e293b\] flex flex-col relative overflow-hidden">/,
  "<div className={`flex-1 bg-white dark:bg-[#1e293b] flex-col relative overflow-hidden ${mobileView === 'list' ? 'hidden sm:flex' : 'flex'}`}>"
);

// 5. Update Header to add Back Button on mobile
code = code.replace(
  /<div className="hidden sm:flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-700\/50 bg-white dark:bg-\[#1e293b\]">/,
  `<div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1e293b]">`
);

code = code.replace(
  /<h3 className="text-lg font-bold text-slate-900 dark:text-white">/,
  `<div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileView('list')}
                className="sm:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">`
);

code = code.replace(
  /\{getSectionTitle\(activeSection \|\| 'appearance'\)\}\s*<\/h3>/,
  `{getSectionTitle(activeSection || 'appearance')}
              </h3>
            </div>`
);


// Find instances of "Password" in SettingsModal (for PIN task)
code = code.replace(/Portal Password/g, 'Portal PIN');
code = code.replace(/Admin Password/g, 'Admin PIN');
code = code.replace(/Update your login password/g, 'Update your login PIN');
code = code.replace(/Update your admin password/g, 'Update your admin PIN');
code = code.replace(/>Current Password</g, '>Current PIN<');
code = code.replace(/>New Password</g, '>New PIN<');
code = code.replace(/>Confirm Password</g, '>Confirm PIN<');
code = code.replace(/placeholder="Enter new password"/g, 'placeholder="Enter new PIN"');
code = code.replace(/placeholder="Confirm new password"/g, 'placeholder="Confirm new PIN"');
code = code.replace(/Change Password/g, 'Change PIN');
code = code.replace(/Update Password/g, 'Update PIN');


fs.writeFileSync(path, code);
