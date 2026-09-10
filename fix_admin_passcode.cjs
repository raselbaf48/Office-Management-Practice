const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

content = content.replace(
  /<RandomizedKeypad value=\{passcode\} onChange=\{setPasscode\} onSubmit=\{handleSubmit\} maxLength=\{10\} \/>/g,
  `<RandomizedKeypad value={passcode} onChange={setPasscode} onSubmit={handleVerify} maxLength={10} />`
);

fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content, 'utf8');
