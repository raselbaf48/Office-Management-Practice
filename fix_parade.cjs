const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

code = code.replace(/<\/button>\n      <\/div>\n\n      \{\/\* OFFICIAL PARADE DOCUMENT/g, `</button>\n        </div>\n      </div>\n\n      {/* OFFICIAL PARADE DOCUMENT`);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
