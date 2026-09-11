const fs = require('fs');
const file = 'src/components/UserLoginGate.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  `      } else {
        setErrorMsg(validation.message || 'Invalid User ID or PIN.');
        setIsLoading(false);
      }`,
  `      } else {
        setErrorMsg(validation.message || 'Invalid User ID or PIN.');
        setPasswordInput('');
        setIsLoading(false);
      }`
);
fs.writeFileSync(file, content);
console.log("Patched user login gate.");
