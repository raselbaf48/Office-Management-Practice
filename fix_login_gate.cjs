const fs = require('fs');
let code = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

code = code.replace(/<\/form>\s*\{\/\* Footer Note \*\/\}/, '</form>\n        )}\n        {/* Footer Note */}');

// The earlier script might have placed it in an unexpected spot or missed it. 
// Let's just fix it completely.
code = code.replace(/          <\/form>\n        \)}\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n\};\n/, '');

fs.writeFileSync('src/components/UserLoginGate.tsx', code);
