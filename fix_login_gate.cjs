const fs = require('fs');

let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// Insert states
if (!content.includes('const hasBiometric =')) {
    content = content.replace(
        "const [isLoading, setIsLoading] = useState<boolean>(false);",
        "const [isLoading, setIsLoading] = useState<boolean>(false);\n  const [showBiometric, setShowBiometric] = useState(false);\n  const hasBiometric = localStorage.getItem('baf_biometric_enabled') === 'true';"
    );
}

// Insert handler
if (!content.includes('const handleBiometricSuccess')) {
    const fn = `
  const handleBiometricSuccess = (bdNo: string) => {
    setShowBiometric(false);
    setIsLoading(true);
    const users = getDetailedUsers();
    const airman = users.find(u => u.bdNo === bdNo);
    if (airman && airman.status === 'ACTIVE') {
      setUserSession(airman);
      setSuccessAirman(airman as any);
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
        "const handleSubmit = (e: React.FormEvent) => {",
        fn + "\n  const handleSubmit = (e: React.FormEvent) => {"
    );
}

fs.writeFileSync('src/components/UserLoginGate.tsx', content);
