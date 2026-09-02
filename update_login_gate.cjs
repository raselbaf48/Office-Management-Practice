const fs = require('fs');

let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// Add import
if (!content.includes('BiometricPromptModal')) {
    content = content.replace(
        "import { setUserSession, validateUserLogin, getDetailedUsers, saveDetailedUsers } from '../utils/authSession';",
        "import { setUserSession, validateUserLogin, getDetailedUsers, saveDetailedUsers } from '../utils/authSession';\nimport { BiometricPromptModal } from './BiometricPromptModal';"
    );
}

// Add state
if (!content.includes('const [showBiometric, setShowBiometric] = useState(false);')) {
    content = content.replace(
        "const [isLoading, setIsLoading] = useState(false);",
        "const [isLoading, setIsLoading] = useState(false);\n  const [showBiometric, setShowBiometric] = useState(false);"
    );
}

// Check biometric enabled
if (!content.includes('const hasBiometric =')) {
    content = content.replace(
        "const [showBiometric, setShowBiometric] = useState(false);",
        "const [showBiometric, setShowBiometric] = useState(false);\n  const hasBiometric = localStorage.getItem('baf_biometric_enabled') === 'true';"
    );
}

// Replace button onClick
const oldAlert = "alert('Biometric login is mocked in preview.')";
const newAlert = "if(hasBiometric) setShowBiometric(true); else alert('Biometric login is not configured on this device. Please enable it in Settings.');";
content = content.replace(oldAlert, newAlert);

// Hide button if not configured? No, if not configured they should get the alert telling them to enable it in settings.
// Or we can just disable it. The prompt specifically said:
// "Oitay dile Fringerprint add hbe, Oi Fringerprint diye User Login Portal, Admin Access Login kora jbe"
// Which means if configured, it should work.

// Add handleBiometricSuccess
if (!content.includes('const handleBiometricSuccess')) {
    const fn = `
  const handleBiometricSuccess = (bdNo: string) => {
    setShowBiometric(false);
    setIsLoading(true);
    // Directly log them in bypassing password
    const users = getDetailedUsers();
    const airman = users.find(u => u.bdNo === bdNo);
    if (airman && airman.status === 'ACTIVE') {
      setUserSession(airman);
      setSuccessAirman(airman);
      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } else {
      setErrorMsg('Biometric user is disabled or not found.');
      setIsLoading(false);
    }
  };
`;
    content = content.replace(
        "const handleSubmit = async (e: React.FormEvent) => {",
        fn + "\n  const handleSubmit = async (e: React.FormEvent) => {"
    );
}

// Add BiometricPromptModal component
const modalJSX = `
      <BiometricPromptModal
        isOpen={showBiometric}
        mode="verify"
        onClose={() => setShowBiometric(false)}
        onSuccess={handleBiometricSuccess}
        purpose="Touch the sensor below to log into your account."
      />
`;

if (!content.includes('showBiometric}')) {
    content = content.replace(
        "    </div>\n  );\n};",
        modalJSX + "\n    </div>\n  );\n};"
    );
}

fs.writeFileSync('src/components/UserLoginGate.tsx', content);
