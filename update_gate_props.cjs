const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

const oldModal = `<BiometricPromptModal
        isOpen={showBiometric}
        mode="verify"
        onClose={() => setShowBiometric(false)}
        onSuccess={handleBiometricSuccess}
        purpose="Touch the sensor below to log into your account."
      />`;

const newModal = `<BiometricPromptModal
        isOpen={showBiometric}
        mode="verify"
        onClose={() => setShowBiometric(false)}
        onSuccess={handleBiometricSuccess}
        purpose="Touch the sensor below to log into your account."
        targetBdNo={bdInput.replace(/^BD\\/?/i, '').trim()}
      />`;

content = content.replace(oldModal, newModal);
fs.writeFileSync('src/components/UserLoginGate.tsx', content);
