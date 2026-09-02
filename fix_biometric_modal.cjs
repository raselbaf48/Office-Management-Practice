const fs = require('fs');
let content = fs.readFileSync('src/components/BiometricPromptModal.tsx', 'utf8');

if (!content.includes('targetBdNo?: string;')) {
    content = content.replace(
        "purpose?: string;\n}",
        "purpose?: string;\n  targetBdNo?: string;\n}"
    );
}

if (!content.includes('targetBdNo }) => {')) {
    content = content.replace(
        "purpose }) => {",
        "purpose, targetBdNo }) => {"
    );
}

const verifyLogicOld = `const isEnabled = localStorage.getItem('baf_biometric_enabled');
          const savedBdNo = localStorage.getItem('baf_biometric_bdNo');
          
          if (isEnabled === 'true' && savedBdNo) {
            setStatus('success');
            setTimeout(() => {
              onSuccess(savedBdNo);
              onClose();
            }, 1000);
          } else {
            setStatus('error');
            setErrorMsg('No fingerprint found on this device.');
            setTimeout(() => {
              setStatus('idle');
              setProgress(0);
            }, 2000);
          }`;

const verifyLogicNew = `const isEnabled = localStorage.getItem('baf_biometric_enabled');
          const savedBdNo = localStorage.getItem('baf_biometric_bdNo');
          
          if (isEnabled !== 'true' || !savedBdNo) {
            setStatus('error');
            setErrorMsg('No fingerprint found on this device.');
            setTimeout(() => {
              setStatus('idle');
              setProgress(0);
            }, 2000);
            return;
          }

          if (targetBdNo && savedBdNo !== targetBdNo) {
            setStatus('error');
            setErrorMsg('Fingerprint does not match the entered User ID.');
            setTimeout(() => {
              setStatus('idle');
              setProgress(0);
            }, 2000);
            return;
          }

          setStatus('success');
          setTimeout(() => {
            onSuccess(savedBdNo);
            onClose();
          }, 1000);`;

content = content.replace(verifyLogicOld, verifyLogicNew);

fs.writeFileSync('src/components/BiometricPromptModal.tsx', content);
