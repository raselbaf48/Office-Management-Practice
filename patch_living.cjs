const fs = require('fs');

let content = fs.readFileSync('src/components/AddEditAirmanModal.tsx', 'utf-8');

// Fix living type null rendering
content = content.replace(
  /\{livingType === 'L_IN' \? \(/,
  "{livingType === 'L_IN' ? ("
);

content = content.replace(
  /\) : \(\s*<div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3">/,
  ") : livingType === 'L_OUT' ? (\n              <div className=\"pt-2 border-t border-slate-200 dark:border-slate-700 space-y-3\">"
);

content = content.replace(
  /                  \)\}\s*<\/div>\s*<\/div>\s*<\/form>/,
  "                  ) : null}\n            </div>\n\n          </div>\n        </form>"
);

fs.writeFileSync('src/components/AddEditAirmanModal.tsx', content, 'utf-8');
console.log('Fixed livingType conditional');
