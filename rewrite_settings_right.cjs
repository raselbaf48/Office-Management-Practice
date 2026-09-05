const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of the right column content area
const startStr = `          {/* Scrollable Content Area */}`;

// The end of the right column should be just before:
const endStr = `        </div>
      </div>
    </div>
  );
};`;

const startIndex = content.indexOf(startStr);
const endIndex = content.lastIndexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end index!");
  process.exit(1);
}

// We will extract all the specific section logic using regex, then rebuild it.
let extracted = content.substring(startIndex, endIndex);

// We need to grab:
// 1. appNotice logic
// 2. maintenanceMode logic
// 3. users logic
// 4. security logic
// 5. database logic
// 6. history logic

const extractSection = (regexMatch) => {
  const match = extracted.match(regexMatch);
  return match ? match[1] : null;
};

const appNotice = extractSection(/\{activeSection === 'appNotice'[\s\S]*?<div className="space-y-6 animate-fadeIn max-w-2xl">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*\)\}/);
const maintenanceMode = extractSection(/\{activeSection === 'maintenanceMode'[\s\S]*?<div className="space-y-6 animate-fadeIn max-w-2xl">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*\)\}/);
const security = extractSection(/\{activeSection === 'security' && \(\s*<div className="space-y-6">([\s\S]*?)<\/div>\s*\)\}/);
const database = extractSection(/\{activeSection === 'database' && \(\s*<div className="space-y-4">([\s\S]*?)<\/div>\s*\)\}/);
const history = extractSection(/\{activeSection === 'history' && role === 'SUPER_ADMIN' && \(\s*<div className="space-y-6">([\s\S]*?\{selectedHistoryUser \? \([\s\S]*?\) : \([\s\S]*?\}\s*<\/div>\s*\)\}/);

// Theme UI (I will recreate it manually since it's missing)
const appearanceCode = `
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-500" />
                  Theme Preference
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'system', label: 'System Theme', icon: <Monitor className="w-5 h-5" /> },
                    { id: 'light', label: 'Light Mode', icon: <Sun className="w-5 h-5" /> },
                    { id: 'dark', label: 'Dark Mode', icon: <Moon className="w-5 h-5" /> }
                  ].map((themeOpt) => (
                    <button
                      key={themeOpt.id}
                      onClick={() => onThemeChange(themeOpt.id as any)}
                      className={\`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all \${currentTheme === themeOpt.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}\`}
                    >
                      {themeOpt.icon}
                      <span className="mt-2 text-sm font-bold">{themeOpt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
`;

const appNoticeCode = appNotice ? \`
          {activeSection === 'appNotice' && role === 'SUPER_ADMIN' && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              \${appNotice}
            </div>
          )}
\` : '';

const maintenanceModeCode = maintenanceMode ? \`
          {activeSection === 'maintenanceMode' && role === 'SUPER_ADMIN' && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              \${maintenanceMode}
            </div>
          )}
\` : '';

const usersCode = \`
          {activeSection === 'users' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (
            <div className="flex-1 h-full overflow-hidden animate-fadeIn">
              <UserManagementTab nominalAirmen={nominalAirmen} userSessionRole={role} userFlight={userFlight} />
            </div>
          )}
\`;

const securityCode = security ? \`
          {activeSection === 'security' && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              \${security}
            </div>
          )}
\` : '';

const databaseCode = database ? \`
          {activeSection === 'database' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              \${database}
            </div>
          )}
\` : '';

const historyCode = history ? \`
          {activeSection === 'history' && role === 'SUPER_ADMIN' && (
            <div className="space-y-6 animate-fadeIn max-w-2xl">
              \${history}
            </div>
          )}
\` : '';

// Rebuild the right column
const newRightColumn = \`          {/* Main Content Area */}
          <div className="flex-1 h-full overflow-hidden flex flex-col relative bg-white dark:bg-[#1e293b]">
            {activeSection !== 'users' ? (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="max-w-3xl mx-auto">
                  \${appearanceCode}
                  \${appNoticeCode}
                  \${maintenanceModeCode}
                  \${securityCode}
                  \${databaseCode}
                  \${historyCode}
                </div>
              </div>
            ) : (
              \${usersCode}
            )}
          </div>
\`;

// Replace in content
content = content.substring(0, startIndex) + newRightColumn + content.substring(endIndex);

fs.writeFileSync('src/components/SettingsModal.tsx.new', content);
console.log("Written to SettingsModal.tsx.new");
