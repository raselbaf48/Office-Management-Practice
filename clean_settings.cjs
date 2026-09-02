const fs = require('fs');
let original = fs.readFileSync('settings_copy.tsx', 'utf8');

const getBlock = (startStr, endStr) => {
  const start = original.indexOf(startStr);
  if (start === -1) return null;
  const end = original.indexOf(endStr, start);
  return original.substring(start, end + endStr.length);
};

const top = original.substring(0, original.indexOf('const sections = ['));

const stateBlock = `  const [editingPasswordType, setEditingPasswordType] = useState<'portal' | 'admin' | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    if (!activeSection) {
      setActiveSection('appearance');
    }
  }, [activeSection]);
`;

const sectionsStart = original.indexOf('const sections = [');
const sectionsEnd = original.indexOf('  return (', sectionsStart);
const sectionsBlock = original.substring(sectionsStart, sectionsEnd);

const cloudSyncBlock = getBlock("{activeSection === 'cloudsync' && (", "          )}");
const usersBlock = getBlock("{activeSection === 'users' && role === 'SUPER_ADMIN' && (", "          )}");
const databaseBlock = getBlock("{activeSection === 'database' && (", "          )}");
const historyStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const historyIdx = original.indexOf(historyStart);
const historyEndStr = "            </div>\n          )}";
const histEndIdx = original.indexOf(historyEndStr, historyIdx);
const historyBlock = original.substring(historyIdx, histEndIdx + historyEndStr.length);

const renderStart = `  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-8">
      {/* 2-Column Split View Desktop / Fullscreen Mobile */}
      <div className="w-full max-w-6xl h-[85vh] bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row overflow-hidden relative">
        
        {/* Left Column: Tabs Navigation (approx 30%) */}
        <div className="w-full sm:w-[30%] sm:max-w-[320px] bg-slate-50 dark:bg-slate-900 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-6 pb-2 flex items-center justify-between sm:justify-start">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-emerald-500" />
              Settings
            </h2>
            <button
              onClick={onClose}
              className="sm:hidden p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as SettingSection)}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer text-left \${
                  activeSection === sec.id
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent font-medium'
                }\`}
              >
                <div className={\`\${activeSection === sec.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}\`}>
                  {sec.icon}
                </div>
                <span className="text-sm">{sec.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active Tab Content (approx 70%) */}
        <div className="flex-1 bg-white dark:bg-[#1e293b] flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="hidden sm:flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#1e293b]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {getSectionTitle(activeSection || 'appearance')}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Display Theme</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        onClick={() => onThemeChange('system')}
                        className={\`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all \${currentTheme === 'system' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-slate-600'}\`}
                      >
                        <Monitor className={\`w-6 h-6 \${currentTheme === 'system' ? 'text-emerald-500' : 'text-slate-400'}\`} />
                        <span className={\`text-sm font-bold \${currentTheme === 'system' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}\`}>System</span>
                      </button>
                      <button
                        onClick={() => onThemeChange('light')}
                        className={\`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all \${currentTheme === 'light' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-slate-600'}\`}
                      >
                        <Sun className={\`w-6 h-6 \${currentTheme === 'light' ? 'text-emerald-500' : 'text-slate-400'}\`} />
                        <span className={\`text-sm font-bold \${currentTheme === 'light' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}\`}>Light</span>
                      </button>
                      <button
                        onClick={() => onThemeChange('dark')}
                        className={\`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all \${currentTheme === 'dark' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-slate-600'}\`}
                      >
                        <Moon className={\`w-6 h-6 \${currentTheme === 'dark' ? 'text-emerald-500' : 'text-slate-400'}\`} />
                        <span className={\`text-sm font-bold \${currentTheme === 'dark' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}\`}>Dark</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Custom Logo URL</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com/logo.png"
                        value={customLogo || ''}
                        onChange={(e) => setCustomLogo(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 dark:text-white" />
                      />
                      <button
                        onClick={handleSaveLogo}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                    {logoSuccess && <p className="text-emerald-500 text-xs mt-2 font-bold">{logoSuccess}</p>}
                  </div>
                </div>
              )}`;

const securityBlock = `
              {activeSection === 'security' && (
                <div className="space-y-6">
                  {/* Biometric Toggle row */}
                  <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Biometric Authentication</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sign in with Fingerprint or Face ID</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setBiometricEnabled(!biometricEnabled)}
                      className={\`w-12 h-6 rounded-full transition-colors relative cursor-pointer \${biometricEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}\`}
                    >
                      <div className={\`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform \${biometricEnabled ? 'translate-x-7' : 'translate-x-1'}\`} />
                    </button>
                  </div>

                  {/* Passwords */}
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
                    
                    {/* Portal Password Item */}
                    <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                          <KeyRound className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">Portal Login Password</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used to access your account</p>
                        </div>
                      </div>
                      {editingPasswordType === 'portal' ? (
                        <form onSubmit={handleUpdatePasscode} className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                          <input type="password" placeholder="Current Password" value={currentPasscode} onChange={e => setCurrentPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                          <input type="password" placeholder="New Password" value={newPasscode} onChange={e => setNewPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                          <input type="password" placeholder="Confirm Password" value={confirmPasscode} onChange={e => setConfirmPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                          {passcodeError && <span className="text-rose-500 text-xs">{passcodeError}</span>}
                          {passcodeSuccess && <span className="text-emerald-500 text-xs">{passcodeSuccess}</span>}
                          <div className="flex gap-2">
                            <button type="submit" disabled={isUpdatingPasscode} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-1.5 text-sm font-bold transition-colors disabled:opacity-50">Save</button>
                            <button type="button" onClick={() => setEditingPasswordType(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg py-1.5 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => setEditingPasswordType('portal')} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                          Update
                        </button>
                      )}
                    </div>

                    {/* Admin Password Item */}
                    {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
                      <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">Admin Access Password</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Used for elevated operations</p>
                          </div>
                        </div>
                        {editingPasswordType === 'admin' ? (
                          <form onSubmit={handleUpdateAdminPasscode} className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                            <input type="password" placeholder="Current Admin Password" value={adminCurrentPasscode} onChange={e => setAdminCurrentPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                            <input type="password" placeholder="New Admin Password" value={adminNewPasscode} onChange={e => setAdminNewPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                            <input type="password" placeholder="Confirm Admin Password" value={adminConfirmPasscode} onChange={e => setAdminConfirmPasscode(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm dark:text-white" />
                            {adminPasscodeError && <span className="text-rose-500 text-xs">{adminPasscodeError}</span>}
                            {adminPasscodeSuccess && <span className="text-emerald-500 text-xs">{adminPasscodeSuccess}</span>}
                            <div className="flex gap-2">
                              <button type="submit" disabled={isUpdatingAdminPasscode} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg py-1.5 text-sm font-bold transition-colors disabled:opacity-50">Save</button>
                              <button type="button" onClick={() => setEditingPasswordType(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg py-1.5 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <button onClick={() => setEditingPasswordType('admin')} className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            Update
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              )}`;

const renderEnd = `
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

const finalFileContent = top + stateBlock + sectionsBlock + renderStart + '\n\n' + cloudSyncBlock + '\n\n' + usersBlock + '\n\n' + securityBlock + '\n\n' + databaseBlock + '\n\n' + historyBlock + '\n' + renderEnd;
fs.writeFileSync('src/components/SettingsModal.tsx', finalFileContent);
console.log('Done cleanly');
