const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

content = content.replace(
  /<RandomizedKeypad \n                    value=\{passwordInput\} \n                    onChange=\{\(val\) => \{ setPasswordInput\(val\); setErrorMsg\(''\); \}\} \n                    maxLength=\{20\}\n                  \/>/g,
  `<RandomizedKeypad 
                    value={passwordInput} 
                    onChange={(val) => { setPasswordInput(val); setErrorMsg(''); }} 
                    onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    maxLength={20}
                  />`
);

fs.writeFileSync('src/components/UserLoginGate.tsx', content, 'utf8');
