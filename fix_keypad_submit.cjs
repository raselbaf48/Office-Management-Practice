const fs = require('fs');

// 1. UserLoginGate.tsx
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// Replace the manual "Done" buttons below RandomizedKeypad
content = content.replace(
  /<RandomizedKeypad \n                    value=\{passwordInput\} \n                    onChange=\{\(val\) => \{ setPasswordInput\(val\); setErrorMsg\(''\); \}\} \n                    maxLength=\{20\}\n                  \/>\n                  <div className="mt-2 text-right">\n                    <button type="button" onClick=\{\(\) => setIsPasswordFocused\(false\)\} className="text-xs text-indigo-600 font-bold p-1">Done<\/button>\n                  <\/div>/g,
  `<RandomizedKeypad 
                    value={passwordInput} 
                    onChange={(val) => { setPasswordInput(val); setErrorMsg(''); }} 
                    onSubmit={handleLoginSubmit}
                    maxLength={20}
                  />`
);

content = content.replace(
  /<RandomizedKeypad value=\{newPass\} onChange=\{setNewPass\} maxLength=\{20\} \/>\n                       <div className="text-right mt-1"><button type="button" onClick=\{\(\) => setIsPasswordFocused\(false\)\} className="text-xs text-emerald-400 font-bold p-1">Done<\/button><\/div>/g,
  `<RandomizedKeypad value={newPass} onChange={setNewPass} onSubmit={() => setIsPasswordFocused(false)} maxLength={20} />`
);

content = content.replace(
  /<RandomizedKeypad value=\{confirmPass\} onChange=\{setConfirmPass\} maxLength=\{20\} \/>\n                       <div className="text-right mt-1"><button type="button" onClick=\{\(\) => setIsConfirmFocused\(false\)\} className="text-xs text-emerald-400 font-bold p-1">Done<\/button><\/div>/g,
  `<RandomizedKeypad value={confirmPass} onChange={setConfirmPass} onSubmit={() => setIsConfirmFocused(false)} maxLength={20} />`
);

fs.writeFileSync('src/components/UserLoginGate.tsx', content, 'utf8');

// 2. AdminPasscodeModal.tsx
let content2 = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

content2 = content2.replace(
  /<RandomizedKeypad value=\{passcode\} onChange=\{setPasscode\} maxLength=\{10\} \/>/g,
  `<RandomizedKeypad value={passcode} onChange={setPasscode} onSubmit={handleSubmit} maxLength={10} />`
);

content2 = content2.replace(
  /<RandomizedKeypad value=\{newPass\} onChange=\{setNewPass\} maxLength=\{10\} \/>\n                         <div className="text-right mt-1"><button type="button" onClick=\{\(\) => setIsPasswordFocused\(false\)\} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold p-1">Done<\/button><\/div>/g,
  `<RandomizedKeypad value={newPass} onChange={setNewPass} onSubmit={() => setIsPasswordFocused(false)} maxLength={10} />`
);

content2 = content2.replace(
  /<RandomizedKeypad value=\{confirmPass\} onChange=\{setConfirmPass\} maxLength=\{10\} \/>\n                         <div className="text-right mt-1"><button type="button" onClick=\{\(\) => setIsConfirmFocused\(false\)\} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold p-1">Done<\/button><\/div>/g,
  `<RandomizedKeypad value={confirmPass} onChange={setConfirmPass} onSubmit={() => setIsConfirmFocused(false)} maxLength={10} />`
);

fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content2, 'utf8');
