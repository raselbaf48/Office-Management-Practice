const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

// Add import
if (!content.includes('BiometricPromptModal')) {
    content = content.replace(
        "import { ChevronRight, Loader2, ShieldAlert, AlertCircle } from 'lucide-react';",
        "import { ChevronRight, Loader2, ShieldAlert, AlertCircle, Fingerprint } from 'lucide-react';\nimport { BiometricPromptModal } from './BiometricPromptModal';"
    );
}

// Add state
if (!content.includes('const [showBiometric, setShowBiometric] = useState(false);')) {
    content = content.replace(
        "const [isVerifying, setIsVerifying] = useState(false);",
        "const [isVerifying, setIsVerifying] = useState(false);\n  const [showBiometric, setShowBiometric] = useState(false);\n  const hasBiometric = localStorage.getItem('baf_biometric_enabled') === 'true';"
    );
}

// Add biometric handler
if (!content.includes('const handleBiometricSuccess')) {
    const fn = `
  const handleBiometricSuccess = (bdNo: string) => {
    setShowBiometric(false);
    setIsVerifying(true);
    const users = getDetailedUsers();
    const airman = users.find(u => u.bdNo === bdNo);
    if (airman && (airman.role === 'ADMIN' || airman.role === 'SUPER_ADMIN')) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 800);
    } else {
      setErrorMsg('This fingerprint is not authorized for Admin Access.');
      setIsVerifying(false);
    }
  };
`;
    content = content.replace(
        "const handleVerify = () => {",
        fn + "\n  const handleVerify = () => {"
    );
}

// Update input wrapper
const oldInput = `<div className="mb-6 w-full">
                <input`;

const newInput = `<div className="mb-6 w-full relative">
                <input`;

content = content.replace(oldInput, newInput);

// Add Fingerprint button
const oldInputEnd = `autoFocus
                />`;
const newInputEnd = `autoFocus
                />
                <button
                  type="button"
                  title="Biometric Login"
                  onClick={() => {
                    if (hasBiometric) setShowBiometric(true);
                    else setErrorMsg('Biometric login is not configured on this device.');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Fingerprint className="w-6 h-6" />
                </button>`;
if (!content.includes('<Fingerprint className="w-6 h-6" />')) {
    content = content.replace(oldInputEnd, newInputEnd);
}

// Add modal
const modalJSX = `
      <BiometricPromptModal
        isOpen={showBiometric}
        mode="verify"
        onClose={() => setShowBiometric(false)}
        onSuccess={handleBiometricSuccess}
        purpose="Touch the sensor below for Admin Access."
      />
`;

if (!content.includes('showBiometric}')) {
    content = content.replace(
        "    </div>\n  );\n};",
        modalJSX + "\n    </div>\n  );\n};"
    );
}

fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content);
