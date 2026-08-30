const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const regex = /\{\/\* Duty Conflicts \*\/\}[\s\S]*?\{\/\* User Session Profile \& Admin Mode Toggle \*\/\}/;

code = code.replace(regex, `{/* Duty Conflicts */}
                        <button
                          onClick={() => handleSelectTab('conflicts')}
                          className={\`w-full flex items-center \${
                            collapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
                          } rounded-xl text-xs font-bold transition-all duration-150 \${
                            activeTab === 'conflicts'
                              ? 'bg-white text-emerald-950 shadow-md scale-[1.01]'
                              : 'text-emerald-100 hover:bg-[#0b4a2d] hover:text-white'
                          }\`}
                          title="Conflict Monitor & Rules"
                        >
                          <div className="flex items-center truncate">
                            <ShieldAlert className={\`w-4 h-4 shrink-0 \${activeTab === 'conflicts' ? 'text-emerald-800' : 'text-emerald-300'}\`} />
                            {!collapsed && <span className="ml-3 truncate">Conflict Monitor</span>}
                          </div>
                          {conflictCount > 0 && !collapsed && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-red-600 text-white rounded-md font-bold">
                              {conflictCount} Alert
                            </span>
                          )}
                        </button>
            </div>
          </div>
        </div>

        {/* User Session Profile & Admin Mode Toggle */}
`);

fs.writeFileSync('src/components/Sidebar.tsx', code);
