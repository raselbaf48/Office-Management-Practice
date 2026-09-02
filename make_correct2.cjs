const fs = require('fs');

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

let orig = fs.readFileSync('settings_copy.tsx', 'utf8');

const getBlock = (startMarker, endMarker) => {
  const start = orig.indexOf(startMarker);
  const end = orig.indexOf(endMarker, start);
  return orig.substring(start, end);
};

const cloudSyncBlock = getBlock("{activeSection === 'cloudsync' && (", "          {/* Section: Users */}");
const usersBlock = getBlock("{activeSection === 'users' && role === 'SUPER_ADMIN' && (", "          {/* Section: Security */}");
const securityBlock = current.substring(current.indexOf("{activeSection === 'security'"), current.indexOf("{activeSection === 'database'"));
const databaseBlock = getBlock("{activeSection === 'database' && (", "          {/* Section: History */}");

// for history, from history start to the closing of history.
const histStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const histStartIdx = orig.indexOf(histStart);
const histEndIdx = orig.indexOf("            </div>\n          )}", histStartIdx);
const historyBlock = orig.substring(histStartIdx, histEndIdx + "            </div>\n          )}".length);


const topAndAppearance = current.substring(0, current.indexOf("{activeSection === 'cloudsync'"));

const newRenderEnd = `
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/SettingsModal.tsx', topAndAppearance + cloudSyncBlock + '\n\n' + usersBlock + '\n\n' + securityBlock + '\n\n' + databaseBlock + '\n\n' + historyBlock + newRenderEnd);
console.log("Written accurately.");
