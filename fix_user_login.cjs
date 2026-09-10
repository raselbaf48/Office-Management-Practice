const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// 1. Set bdInput default to last used
content = content.replace(
  /const \[bdInput, setBdInput\] = useState\(''\);/,
  `const [bdInput, setBdInput] = useState(() => {
    try {
      return localStorage.getItem('baf_last_used_id') || '';
    } catch { return ''; }
  });`
);

// 2. Save baf_last_used_id on successful login
content = content.replace(
  /setRecentLogins\(newRecents\);\n\n        setSuccessAirman\(targetAirman\);/,
  `setRecentLogins(newRecents);
        localStorage.setItem('baf_last_used_id', cleanInput);

        setSuccessAirman(targetAirman);`
);

// 3. Rename "Password" to "PIN" in UserLoginGate
content = content.replace(/Forgot Login Password\?/g, 'Forgot Login PIN?');
content = content.replace(/>Password</g, '>PIN<');
content = content.replace(/>PASSWORD RECOVERY</g, '>PIN RECOVERY<');
content = content.replace(/Password Reset/g, 'PIN Reset');
content = content.replace(/Enter New Password/g, 'Enter New PIN');
content = content.replace(/Confirm Your Password/g, 'Confirm Your PIN');
content = content.replace(/Save Password/g, 'Save PIN');
content = content.replace(/Passwords do not match/g, 'PINs do not match');
content = content.replace(/enter both password fields/g, 'enter both PIN fields');
content = content.replace(/Invalid User ID or Password/g, 'Invalid User ID or PIN');

fs.writeFileSync('src/components/UserLoginGate.tsx', content, 'utf8');
