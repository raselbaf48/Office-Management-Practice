const fs = require('fs');
let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

content = content.replace(
  /\) : \(\s*<div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-[0-9.]+">/,
  ") : livingType === 'L_OUT' ? (\n              <div className=\"pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5\">"
);

content = content.replace(
  /                  \)\}\s*<\/div>\s*<\/div>\s*<\/form>/,
  "                  ) : null}\n            </div>\n\n          </div>\n        </form>"
);

fs.writeFileSync('src/components/AddEditAirmanModal.tsx', content, 'utf-8');
console.log('Fixed livingType conditional properly');
