const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const replacement = `
        {/* MODAL HEADER - HIDDEN ON PRINT */}
        <div className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10 sticky top-0">
          <div className="flex items-center space-x-3 text-white">
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-black tracking-widest uppercase">
                {isPtDocument ? 'OFFICIAL PT STATE' : 'OFFICIAL PARADE STATE'}
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">
                Use 'Save as PDF' or Print directly
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadDocx}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Document</span>
            </button>
            <button
              onClick={() => {
                document.title = getPdfTitle();
                window.print();
              }}
              className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Official Export / Print</span>
            </button>
          </div>
        </div>
`;

// use a regular expression to match the old block
const regex = /\{\/\* MODAL HEADER - HIDDEN ON PRINT \*\/\}[\s\S]*?Official Export \/ Print<\/span>\s*<\/button>\s*<\/div>\s*<\/div>/;
content = content.replace(regex, replacement.trim());
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);
