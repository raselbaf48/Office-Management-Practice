const fs = require('fs');

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// The issue in SettingsModal.tsx is that we are missing the final closing `</div>` and `)}` for the `database` section!
// Wait, `databaseBlock` from previous run ended with:
//               )}

current = current.replace(/              \)}\n\n\{activeSection === 'history'/s, "              )}\n            </div>\n          )}\n\n{activeSection === 'history'");

fs.writeFileSync('src/components/SettingsModal.tsx', current);
console.log("fixed missing div");
