const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

const regex = /{showBiometricPrompt && \([\s\S]*?<BiometricPromptModal[\s\S]*?\/>\s*\)}/;
content = content.replace(regex, '');

fs.writeFileSync('src/components/SettingsModal.tsx', content);
