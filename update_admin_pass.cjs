const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPasscodeModal.tsx', 'utf8');

if (!content.includes('RandomizedKeypad')) {
  content = content.replace("import { Airman", "import { RandomizedKeypad } from './RandomizedKeypad';\nimport { Airman");
}

if (!content.includes('isPasswordFocused')) {
  content = content.replace("const [passcode, setPasscode] = useState('');", "const [passcode, setPasscode] = useState('');\n  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(true);\n  const [isConfirmFocused, setIsConfirmFocused] = useState<boolean>(false);");
}

// Admin Passcode main input
content = content.replace(
  /<input\s*type="password"\s*value=\{passcode\}\s*onChange=\{\(e\) => setPasscode\(e\.target\.value\)\}\s*onKeyDown=\{\(e\) => e\.key === 'Enter' && handleVerify\(\)\}\s*disabled=\{isSuccess \|\| isVerifying \|\| lockRemainingSec > 0\}\s*className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-2xl font-mono tracking-\[0\.5em\] text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50"\s*placeholder="••••"\s*autoFocus\s*maxLength=\{10\}\s*\/>/g,
  `<input
                  type="password"
                  value={passcode}
                  readOnly
                  onFocus={() => setIsPasswordFocused(true)}
                  disabled={isSuccess || isVerifying || lockRemainingSec > 0}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-2xl font-mono tracking-[0.5em] text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-all disabled:opacity-50 cursor-pointer"
                  placeholder="••••"
                  autoFocus
                  maxLength={10}
                />
                
                {isPasswordFocused && !isSuccess && !isVerifying && lockRemainingSec === 0 && (
                  <div className="pt-2 animate-fadeIn">
                    <RandomizedKeypad value={passcode} onChange={setPasscode} maxLength={10} />
                  </div>
                )}`
);

// Admin Passcode Reset New Pass
content = content.replace(
  /<input\s*type="password"\s*value=\{newPass\}\s*onChange=\{\(e\) => setNewPass\(e\.target\.value\)\}\s*className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all text-center tracking-widest text-lg"\s*required\s*autoFocus\s*\/>/g,
  `<input
                      type="password"
                      value={newPass}
                      readOnly
                      onFocus={() => { setIsPasswordFocused(true); setIsConfirmFocused(false); }}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all text-center tracking-widest text-lg cursor-pointer"
                      required
                      autoFocus
                    />
                    {isPasswordFocused && (
                      <div className="pt-2">
                         <RandomizedKeypad value={newPass} onChange={setNewPass} maxLength={10} />
                         <div className="text-right mt-1"><button type="button" onClick={() => setIsPasswordFocused(false)} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold p-1">Done</button></div>
                      </div>
                    )}`
);

// Admin Passcode Reset Confirm Pass
content = content.replace(
  /<input\s*type="password"\s*value=\{confirmPass\}\s*onChange=\{\(e\) => setConfirmPass\(e\.target\.value\)\}\s*className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all text-center tracking-widest text-lg"\s*required\s*\/>/g,
  `<input
                      type="password"
                      value={confirmPass}
                      readOnly
                      onFocus={() => { setIsConfirmFocused(true); setIsPasswordFocused(false); }}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all text-center tracking-widest text-lg cursor-pointer"
                      required
                    />
                    {isConfirmFocused && (
                      <div className="pt-2">
                         <RandomizedKeypad value={confirmPass} onChange={setConfirmPass} maxLength={10} />
                         <div className="text-right mt-1"><button type="button" onClick={() => setIsConfirmFocused(false)} className="text-xs text-emerald-600 dark:text-emerald-400 font-bold p-1">Done</button></div>
                      </div>
                    )}`
);

fs.writeFileSync('src/components/AdminPasscodeModal.tsx', content);
