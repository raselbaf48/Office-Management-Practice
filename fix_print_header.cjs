const fs = require('fs');
const file = 'src/components/PrintableNominalRollModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `      {/* Top Header Controls (Hidden on Print) */}
      <div className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between shadow-2xl print:hidden z-10">
        <div className="flex items-center space-x-3 text-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-widest">
              OFFICIAL NOMINAL ROLL PRINT PREVIEW
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Use 'Save as PDF' or Print directly
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportHtmlToWord('print-nominal-roll-content', 'Nominal_Roll_155_UASU_BAF.doc')}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Document</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            <span>Official Export / Print</span>
          </button>
        </div>
      </div>`;

const replaceCode = `      {/* Top Header Controls (Hidden on Print) */}
      <div className="flex-none bg-slate-900 border-b border-slate-700 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 shadow-2xl print:hidden z-10">
        <div className="flex items-center space-x-3 text-white">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-widest leading-tight">
              OFFICIAL NOMINAL ROLL PRINT PREVIEW
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">
              Use 'Save as PDF' or Print directly
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => exportHtmlToWord('print-nominal-roll-content', 'Nominal_Roll_155_UASU_BAF.doc')}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="text-center">Export Doc</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-center">Official Print</span>
          </button>
        </div>
      </div>`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched PrintableNominalRollModal header!");
