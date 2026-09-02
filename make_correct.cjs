const fs = require('fs');

let current = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// The file has `{activeSection === 'history' ... }`
// The last thing before renderEnd is `              </div>\n            </div>\n          )}`

let historyIdx = current.indexOf("{activeSection === 'history'");
// Find the `})()}` which is in history:
// In history, there is an IIFE `(() => { ... })()}`
// And then `              </div>`
// And then `            </div>`
// And then `          )}`

let historyBlockStart = current.substring(0, historyIdx);

// Let's just grab history block directly from settings_copy.tsx and append the EXACT renderEnd
let orig = fs.readFileSync('settings_copy.tsx', 'utf8');
let origHistStart = orig.indexOf("{activeSection === 'history'");
let origHistEndStr = "            </div>\n          )}";
let origHistEndIdx = orig.indexOf(origHistEndStr, origHistStart) + origHistEndStr.length;
let historyBlock = orig.substring(origHistStart, origHistEndIdx);

const newRenderEnd = `
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/SettingsModal.tsx', historyBlockStart + historyBlock + newRenderEnd);
