const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// The biometric button onClick should check bdInput
const oldBtn = `onClick={() => { if(hasBiometric) setShowBiometric(true); else alert('Biometric login is not configured on this device. Please enable it in Settings.'); }}`;
const newBtn = `onClick={() => {
                    const cleanInput = bdInput.replace(/^BD\\/?/i, '').trim();
                    if (!cleanInput) {
                      setErrorMsg('Please enter your User ID first.');
                      return;
                    }
                    if(hasBiometric) {
                      setShowBiometric(true);
                    } else {
                      alert('Biometric login is not configured on this device. Please enable it in Settings.');
                    }
                  }}`;

content = content.replace(oldBtn, newBtn);

fs.writeFileSync('src/components/UserLoginGate.tsx', content);
