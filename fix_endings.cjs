const fs = require('fs');
const file = 'src/components/SettingsModal.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

lines[1115] = '          )}';
lines[1116] = '        </div>';
lines[1117] = '      </div>';
lines[1118] = '    ) : (';
lines[1119] = '      <div className="flex-1 h-full overflow-hidden">';
lines[1120] = '        {activeSection === "users" && (role === "SUPER_ADMIN" || role === "ADMIN") && (';
lines[1121] = '          <UserManagementTab nominalAirmen={nominalAirmen} userSessionRole={role} userFlight={userFlight} />';
lines[1122] = '        )}';
lines[1123] = '      </div>';
lines[1124] = '    )}';
lines[1125] = '  </div>';
lines[1126] = '</div>';
lines[1127] = '</div></div></div>'; // Close main modals
// We need to shift everything down by 8 lines. So let's insert it cleanly.

// Actually, let's just splice it!
let historyEnd = lines.findIndex(l => l.includes('{/* Delete Single History Item Confirmation Modal */}'));
if (historyEnd !== -1) {
  // Replace the closing block
  let block = [
    '          )}',
    '        </div>',
    '      </div>',
    '    ) : (',
    '      <div className="flex-1 h-full overflow-hidden">',
    '        {activeSection === "users" && (role === "SUPER_ADMIN" || role === "ADMIN") && (',
    '          <UserManagementTab nominalAirmen={nominalAirmen} userSessionRole={role} userFlight={userFlight} />',
    '        )}',
    '      </div>',
    '    )}',
    '  </div>',
    '</div>',
    '</div></div></div>'
  ];
  
  lines.splice(historyEnd - 3, 3, ...block);
}

fs.writeFileSync(file, lines.join('\n'));
