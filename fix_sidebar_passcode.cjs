const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const passcodeButton = `              onOpenAdminLogin && (
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Enter Master Passcode for Admin privileges"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Passcode</span>
                </button>
              )
            )}`;

code = code.replace(passcodeButton, ')}');
fs.writeFileSync('src/components/Sidebar.tsx', code);
