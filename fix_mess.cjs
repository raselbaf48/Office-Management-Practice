const fs = require('fs');
let text = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// Replace the 3 divs inserted before );
text = text.replace(/      <\/div>\n      <\/div>\n      <\/div>\n(.*);\n/g, '$1;\n');
// Also some were inserted before ); with spaces
text = text.replace(/      <\/div>\n      <\/div>\n      <\/div>\n(\s*)\);\n/g, '$1);\n');
// Also the 2 divs inserted earlier
text = text.replace(/      <\/div>\n      <\/div>\n(\s*)\);\n/g, '$1);\n');

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', text);
