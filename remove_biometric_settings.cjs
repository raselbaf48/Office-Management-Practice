const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Import
content = content.replace(/import { BiometricPromptModal } from '\.\/BiometricPromptModal';\n/, '');

// States
content = content.replace(/  const \[biometricEnabled, setBiometricEnabled\] = useState\(\(\) => localStorage.getItem\('baf_biometric_enabled'\) === 'true'\);\n/, '');
content = content.replace(/  const \[showBiometricPrompt, setShowBiometricPrompt\] = useState\(false\);\n/, '');

// Toggle row
const toggleRegex = /{\/\* Biometric Toggle row \*\/}[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/;
content = content.replace(toggleRegex, '');

// Modal
const modalRegex = /{showBiometricPrompt && \([\s\S]*?<\/BiometricPromptModal>[\s\S]*?\)}/;
content = content.replace(modalRegex, '');

fs.writeFileSync('src/components/SettingsModal.tsx', content);
