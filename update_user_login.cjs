const fs = require('fs');
let content = fs.readFileSync('src/components/UserLoginGate.tsx', 'utf8');

// Add import
if (!content.includes('RandomizedKeypad')) {
  content = content.replace("import { setUserSession", "import { RandomizedKeypad } from './RandomizedKeypad';\nimport { setUserSession");
}

// Add state
if (!content.includes('isPasswordFocused')) {
  content = content.replace("const [isUserIdFocused, setIsUserIdFocused] = useState<boolean>(false);", "const [isUserIdFocused, setIsUserIdFocused] = useState<boolean>(false);\n  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);");
}

// Update password input
content = content.replace(
  /<input\s*type=\{showPin \? "text" : "password"\}\s*value=\{passwordInput\}\s*onChange=\{\(e\) => \{ setPasswordInput\(e\.target\.value\); setErrorMsg\(''\); \}\}\s*className="w-full bg-slate-800\/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500\/20 rounded-2xl px-4 py-3\.5 pr-12 text-sm font-mono font-bold text-white outline-none transition-all"\s*\/>/g,
  `<input
                  type={showPin ? "text" : "password"}
                  value={passwordInput}
                  readOnly
                  onFocus={() => setIsPasswordFocused(true)}
                  className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl px-4 py-3.5 pr-12 text-sm font-mono font-bold text-white outline-none transition-all cursor-pointer"
                  placeholder="Tap to open keypad"
                />`
);

// Add keypad below the button in the relative div
content = content.replace(
  /<\/button>\s*<\/div>\s*<\/div>\s*<button/g,
  `</button>
              </div>
              {isPasswordFocused && (
                <div className="pt-2 animate-fadeIn">
                  <RandomizedKeypad 
                    value={passwordInput} 
                    onChange={(val) => { setPasswordInput(val); setErrorMsg(''); }} 
                    maxLength={20}
                  />
                  <div className="mt-2 text-right">
                    <button type="button" onClick={() => setIsPasswordFocused(false)} className="text-xs text-emerald-400 font-bold p-2 hover:bg-emerald-900/30 rounded-lg">Done</button>
                  </div>
                </div>
              )}
            </div>
            
            <button`
);

// Also update the password reset input (New Password)
content = content.replace(
  /<input\s*type="password"\s*value=\{newPass\}\s*onChange=\{\(e\) => setNewPass\(e\.target\.value\)\}\s*className="w-full px-4 py-3\.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"\s*required\s*autoFocus\s*\/>/g,
  `<input
                    type="password"
                    value={newPass}
                    readOnly
                    onFocus={() => { setIsPasswordFocused(true); setIsConfirmFocused(false); }}
                    className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    required
                  />
                  {isPasswordFocused && (
                    <div className="pt-2">
                       <RandomizedKeypad value={newPass} onChange={setNewPass} maxLength={20} />
                       <div className="text-right mt-1"><button type="button" onClick={() => setIsPasswordFocused(false)} className="text-xs text-emerald-400 font-bold p-1">Done</button></div>
                    </div>
                  )}`
);

// And the Confirm Password input
content = content.replace(
  /<input\s*type="password"\s*value=\{confirmPass\}\s*onChange=\{\(e\) => setConfirmPass\(e\.target\.value\)\}\s*className="w-full px-4 py-3\.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"\s*required\s*\/>/g,
  `<input
                    type="password"
                    value={confirmPass}
                    readOnly
                    onFocus={() => { setIsConfirmFocused(true); setIsPasswordFocused(false); }}
                    className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    required
                  />
                  {isConfirmFocused && (
                    <div className="pt-2">
                       <RandomizedKeypad value={confirmPass} onChange={setConfirmPass} maxLength={20} />
                       <div className="text-right mt-1"><button type="button" onClick={() => setIsConfirmFocused(false)} className="text-xs text-emerald-400 font-bold p-1">Done</button></div>
                    </div>
                  )}`
);


if (!content.includes('isConfirmFocused')) {
  content = content.replace("const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);", "const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);\n  const [isConfirmFocused, setIsConfirmFocused] = useState<boolean>(false);");
}

fs.writeFileSync('src/components/UserLoginGate.tsx', content);
