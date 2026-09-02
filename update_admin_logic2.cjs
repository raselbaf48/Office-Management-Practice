const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

const oldModal = `<BiometricPromptModal
        isOpen={showBiometric}
        mode="verify"
        onClose={() => setShowBiometric(false)}
        onSuccess={handleBiometricSuccess}
        purpose="Touch the sensor below for Admin Access."
      />`;

const newModal = `<BiometricPromptModal
        isOpen={showBiometric}
        mode="verify"
        onClose={() => setShowBiometric(false)}
        onSuccess={handleBiometricSuccess}
        purpose="Touch the sensor below for Admin Access."
        targetBdNo={bdNo}
      />`;

content = content.replace(oldModal, newModal);
fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content);
