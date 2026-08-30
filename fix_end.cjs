const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

const regex = /                    <\/div>\n                  \)\)\n                \)\}\n              <\/div>\n            <\/div>\n          \)\}\n        <\/div>\n        \{\/\* Footer \*\/\}/;

const newCode = `                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        {/* Footer */}`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);
