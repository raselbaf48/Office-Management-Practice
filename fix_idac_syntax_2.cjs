const fs = require('fs');
let code = fs.readFileSync('src/components/IdacSettingsModal.tsx', 'utf8');

const regex = /\s*\}\)\}\s*<\/div>\s*<\/div>\s*\}\)\s*<\/div>\s*\{\/\* Footer \*\/\}/;

code = code.replace(
  /\}\)\}\s*<\/div>\s*<\/div>\s*\}\)\s*<\/div>\s*\{\/\* Footer \*\/\}/,
  '})}\n              </div>\n            )}\n          </div>\n        </div>\n        {/* Footer */}'
);
fs.writeFileSync('src/components/IdacSettingsModal.tsx', code);
