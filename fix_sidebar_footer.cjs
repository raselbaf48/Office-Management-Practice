const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const regex = /\{\/\* Footer Role & Unit Info \*\/\}[\s\S]*?<\/div>/;
const newFooter = `{/* Footer Role & Unit Info */}
        <div className="px-3 py-3 bg-[#042013] border-t border-[#093c24] shrink-0">
          {!collapsed ? (
            <div className="flex flex-col items-center justify-center text-[11px] text-emerald-300/50 font-black tracking-wider leading-tight">
              <span>155 UASU BAF</span>
              <span>BAF BASE ZHR</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            </div>
          )}
        </div>`;

code = code.replace(regex, newFooter);
fs.writeFileSync('src/components/Sidebar.tsx', code);
