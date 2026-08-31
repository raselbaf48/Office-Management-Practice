const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetStr = `            {/* Admin Login / Logout */}
            <div className="pt-2 flex flex-col space-y-1">
              {role === 'USER' && onOpenAdminLogin && (
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className={\`w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-colors text-xs font-bold \${collapsed ? 'px-1' : ''}\`}
                  title="Elevate Access (Admin / Owner)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  {!collapsed && <span>Elevate Access</span>}
                </button>
              )}
              {role !== 'USER' && onLogoutAdmin && (
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className={\`w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors text-xs font-bold \${collapsed ? 'px-1' : ''}\`}
                  title="Exit Admin/Owner Mode"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  {!collapsed && <span>Exit Privileged Mode</span>}
                </button>
              )}
            </div>`;

code = code.replace(targetStr, '');
fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log("Success");
