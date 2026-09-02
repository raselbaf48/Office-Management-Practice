const fs = require('fs');

let content = fs.readFileSync('src/components/SettingsModal.tsx', 'utf8');

// Add import for BiometricPromptModal if not there
if (!content.includes('BiometricPromptModal')) {
    content = content.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect } from 'react';\nimport { BiometricPromptModal } from './BiometricPromptModal';"
    );
}

// Add state for showBiometricPrompt
if (!content.includes('const [showBiometricPrompt')) {
    content = content.replace(
        "const [biometricEnabled, setBiometricEnabled] = useState(false);",
        "const [biometricEnabled, setBiometricEnabled] = useState(() => localStorage.getItem('baf_biometric_enabled') === 'true');\n  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);"
    );
}

// Update the toggle button logic
const oldBtnStr = `onClick={() => setBiometricEnabled(!biometricEnabled)}`;
const newBtnStr = `onClick={() => {\n                        if (!biometricEnabled) {\n                          setShowBiometricPrompt(true);\n                        } else {\n                          setBiometricEnabled(false);\n                          localStorage.removeItem('baf_biometric_enabled');\n                          localStorage.removeItem('baf_biometric_bdNo');\n                        }\n                      }}`;

content = content.replace(oldBtnStr, newBtnStr);

// Add the modal component at the end before final div closure (if not there)
const modalJSX = `
      {showBiometricPrompt && (
        <BiometricPromptModal
          isOpen={showBiometricPrompt}
          mode="register"
          onClose={() => setShowBiometricPrompt(false)}
          onSuccess={() => {
            setBiometricEnabled(true);
            setShowBiometricPrompt(false);
          }}
        />
      )}
`;

if (!content.includes('<BiometricPromptModal')) {
    const splitIndex = content.lastIndexOf('</div>\n    </div>\n  );\n};');
    if (splitIndex !== -1) {
        content = content.substring(0, splitIndex) + modalJSX + content.substring(splitIndex);
    }
}

fs.writeFileSync('src/components/SettingsModal.tsx', content);
