const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The start of the scrollable content area
const oldContentStart = `{/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-8">`;

const newContentStart = `{/* Main Content Area */}
          <div className="flex-1 h-full overflow-hidden flex flex-col bg-white dark:bg-[#1e293b]">
            {activeSection !== 'users' ? (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Appearance */}
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
                              onClick={() => onThemeChange(themeOpt.id)}
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

content = content.replace(oldContentStart, newContentStart);

// Now fix the end of it, wrapping it properly
// The `users` section was:
//        {activeSection === 'users' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (
//            <div className="flex-1 h-full">
//              <UserManagementTab nominalAirmen={nominalAirmen} userSessionRole={role} userFlight={userFlight} />
//            </div>
//          )}

// I need to change how `users` is rendered.
const usersBlock = `{activeSection === 'users' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (
            <div className="flex-1 h-full">
              <UserManagementTab nominalAirmen={nominalAirmen} userSessionRole={role} userFlight={userFlight} />
            </div>
          )}`;
content = content.replace(usersBlock, "");

// Close the padded scrollable div, then put users.
const endingToReplace = `          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};`;

const newEnding = `          )}
                </div>
              </div>
            ) : (
              <div className="flex-1 h-full overflow-hidden">
                {activeSection === 'users' && (role === 'SUPER_ADMIN' || role === 'ADMIN') && (
                  <UserManagementTab nominalAirmen={nominalAirmen} userSessionRole={role} userFlight={userFlight} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};`;

content = content.replace(`            </div>
          </div>
        </div>
      </div>
    </div>
  );
};`, newEnding);

// Next, strip out the inner scrollable containers of appNotice and maintenanceMode
// appNotice:
// <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
//   <div className="flex-1 overflow-y-auto p-6 space-y-8">
//     <div className="space-y-6 animate-fadeIn max-w-2xl">
content = content.replace(
  /<div className="flex flex-col h-full overflow-hidden animate-fadeIn">\s*<div className="flex-1 overflow-y-auto p-6 space-y-8">\s*<div className="space-y-6 animate-fadeIn max-w-2xl">/g,
  '<div className="space-y-6 animate-fadeIn max-w-2xl">'
);

// We need to also remove the closing divs for appNotice and maintenanceMode
// For appNotice:
/*
                      )}
                    </div>
                  </div>
              </div>
            </div>
        )}
*/
// Let's just fix it globally.
// The easiest is just regex for the closing part of appNotice and maintenanceMode
// It's basically two extra </div>s
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\)\}/g, "</div>)}");

fs.writeFileSync(file, content);
