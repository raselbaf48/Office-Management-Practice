const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

const replacement = `
          <button
            onClick={handleDownloadDocx}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer mr-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Document</span>
          </button>
          <button
            onClick={() => {
              document.title = getPdfTitle();
              window.print();
            }}
`;

content = content.replace(`<button\n            onClick={() => {\n              document.title = getPdfTitle();\n              window.print();\n            }}`, replacement);
fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', content);
