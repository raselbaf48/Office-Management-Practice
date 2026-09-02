const fs = require('fs');

let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

const fn = `
  const handleBiometricSuccess = (bdNo: string) => {
    setShowBiometric(false);
    setIsLoading(true);
    const users = getDetailedUsers();
    const detailedUser = users.find(u => u.bdNo === bdNo);
    const airmanData = airmen.find(a => a.bdNo === bdNo);
    if (detailedUser && detailedUser.status === 'ACTIVE' && airmanData) {
      setUserSession(airmanData);
      setSuccessAirman(airmanData);
      setTimeout(() => {
        onAuthenticated();
      }, 1000);
    } else {
      setErrorMsg('Biometric user is disabled or not found.');
      setIsLoading(false);
    }
  };
`;

content = content.replace(/const handleBiometricSuccess = \([^)]*\) => {[\s\S]*?};\n/, fn);

fs.writeFileSync('src/components/UserLoginGate.tsx', content);
