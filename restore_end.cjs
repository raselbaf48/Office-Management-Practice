const fs = require('fs');

let original = fs.readFileSync('settings_copy.tsx', 'utf8');

const historyStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const historyIdx = original.indexOf(historyStart);
const historyEndStr = "            </div>\n          )}\n\n        </div>\n      </div>\n    </div>\n  );\n};";
const endIdx = original.indexOf(historyEndStr, historyIdx);
const historyBlock = original.substring(historyIdx, endIdx + "            </div>\n          )}".length);

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');
const curHistoryStart = "{activeSection === 'history' && role === 'SUPER_ADMIN' && (";
const curHistoryIdx = current.indexOf(curHistoryStart);

const newEnd = `
        </div>
      </div>
    </div>
  );
};
`;

const beforeHistory = current.substring(0, curHistoryIdx);

fs.writeFileSync('src/components/SettingsModal.tsx', beforeHistory + historyBlock + newEnd);
console.log('Restored history and ending correctly');
