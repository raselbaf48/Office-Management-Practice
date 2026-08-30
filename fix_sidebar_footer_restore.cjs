const fs = require('fs');

let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const regex = /\{\/\* Footer Role \& Unit Info \*\/\}[\s\S]*?\};\n?$/;
const newFooter = `{/* Footer Role & Unit Info */}
        <div className="px-3 py-2 bg-[#042013] border-t border-[#093c24] shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between text-[11px] text-emerald-300/60">
              <span className="font-semibold truncate">155 UASU BAF • BAF BASE ZHR</span>
              <span className="text-[10px] text-emerald-400/50 font-mono">v2.5</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};`;

code = code.replace(regex, newFooter);
fs.writeFileSync('src/components/Sidebar.tsx', code);
