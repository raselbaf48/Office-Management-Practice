const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

content = content.replace(
  /type=\{showPin \? "text" : "password"\}\n                  value=\{passwordInput\}\n                  readOnly\n                  onFocus=\{\(\) => \{ setIsPasswordFocused\(true\); setIsUserIdFocused\(false\); \}\}/g,
  `type={showPin ? "text" : "password"}
                  value={passwordInput}
                  readOnly
                  autoFocus
                  onFocus={() => { setIsPasswordFocused(true); setIsUserIdFocused(false); }}`
);

fs.writeFileSync('src/components/UserLoginGate.tsx', content, 'utf8');
