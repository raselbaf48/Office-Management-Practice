const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// 1. Make isPasswordFocused true by default
content = content.replace(
  /const \[isPasswordFocused, setIsPasswordFocused\] = useState<boolean>\(false\);/g,
  `const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(true);`
);

// 2. Remove autoFocus and update onFocus for bdInput (User ID)
content = content.replace(
  /autoFocus\n                  value=\{bdInput\}\n                  onFocus=\{\(\) => setIsUserIdFocused\(true\)\}/g,
  `value={bdInput}
                  onFocus={() => { setIsUserIdFocused(true); setIsPasswordFocused(false); }}`
);

// 3. Update onFocus for PIN input to close User ID dropdown
content = content.replace(
  /onFocus=\{\(\) => setIsPasswordFocused\(true\)\}/g,
  `onFocus={() => { setIsPasswordFocused(true); setIsUserIdFocused(false); }}`
);

fs.writeFileSync('src/components/UserLoginGate.tsx', content, 'utf8');
