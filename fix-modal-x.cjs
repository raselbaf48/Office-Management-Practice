const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const target = `            <button
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
        </div>`;

const replacement = `            <button
              onClick={() => {
                document.title = getPdfTitle();
                window.print();
              }}
              className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Official Export / Print</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer ml-3"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
          </div>
        </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);
