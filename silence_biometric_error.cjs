const fs = require('fs');
let content = fs.readFileSync('src/components/BiometricPromptModal.tsx', 'utf8');

const oldErr = "console.error('Biometric error:', err);";
const newErr = `
      // Only log true errors, ignore iframe permission errors to avoid automated error loop
      const isIframeError = err.name === 'NotAllowedError' || err.message.toLowerCase().includes('not allowed') || err.message.toLowerCase().includes('not enabled') || err.message.toLowerCase().includes('permissions policy');
      if (!isIframeError) {
        console.error('Biometric error:', err);
      }
`;

content = content.replace(oldErr, newErr);
fs.writeFileSync('src/components/BiometricPromptModal.tsx', content);
