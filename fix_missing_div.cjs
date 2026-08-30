const fs = require('fs');

let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

code = code.replace(
  /<\/span>\s*<\/div>\s*\{\/\* Table Body \(Days 1 to 31\) \*\/\}/g,
  '</span>\n                  </div>\n                </div>\n                {/* Table Body (Days 1 to 31) */}'
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
