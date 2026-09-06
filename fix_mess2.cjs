const fs = require('fs');
let text = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// The sed command inserted '          </div>' before '        )}'
text = text.replace(/          <\/div>\n        \)}/g, '        )}');

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', text);
