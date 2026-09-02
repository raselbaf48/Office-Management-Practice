const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

// Imports
content = content.replace(/import { BiometricPromptModal } from '\.\/BiometricPromptModal';\n/, '');
content = content.replace(/Fingerprint, /g, '');

// States
content = content.replace(/  const \[showBiometric, setShowBiometric\] = useState\(false\);\n  const hasBiometric = localStorage.getItem\('baf_biometric_enabled'\) === 'true';\n/, '');

// Function
content = content.replace(/  const handleBiometricSuccess = \([^)]*\) => {[\s\S]*?};\n/, '');

// Button
const btnRegex = /<button[\s\S]*?<Fingerprint[\s\S]*?<\/button>/;
content = content.replace(btnRegex, '');

// Modal
const modalRegex = /<BiometricPromptModal[\s\S]*?\/>/;
content = content.replace(modalRegex, '');

fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content);
