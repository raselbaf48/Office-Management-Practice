const fs = require('fs');
const file = 'src/components/AdminPasscodeModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = /<input\s+type="password"\s+value=\{passcode\}\s+readOnly\s+onFocus=\{[^}]+\}\s+disabled=\{[^}]+\}\s+className="[^"]+"\s+placeholder="••••"\s+autoFocus\s+maxLength=\{10\}\s+\/>/m;

const replacementStr = `<div 
                  className="flex justify-center space-x-3 sm:space-x-4 mb-4 cursor-pointer outline-none" 
                  onClick={() => setIsPasswordFocused(true)}
                  tabIndex={0}
                  onFocus={() => setIsPasswordFocused(true)}
                >
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={\`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl flex items-center justify-center text-4xl font-black border-2 transition-all \${
                        isPasswordFocused && passcode.length === index
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-4 ring-emerald-500/20'
                          : passcode.length > index
                          ? 'border-slate-800 bg-slate-800 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'
                      }\`}
                    >
                      {passcode.length > index ? '•' : ''}
                    </div>
                  ))}
                </div>`;

if (targetStr.test(content)) {
  content = content.replace(targetStr, replacementStr);
  
  content = content.replace(/<RandomizedKeypad value=\{passcode\} onChange=\{setPasscode\} onSubmit=\{handleVerify\} maxLength=\{10\} \/>/g, 
                            '<RandomizedKeypad value={passcode} onChange={setPasscode} onSubmit={handleVerify} maxLength={4} />');
  
  fs.writeFileSync(file, content);
  console.log("Patched AdminPasscodeModal.");
} else {
  console.log("Could not find target string in AdminPasscodeModal.");
}
