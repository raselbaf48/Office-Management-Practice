const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const oldStr = '{/* Official Export / Print Button */}\n          <button\n            onClick={handleExportOrPrint}';

// Let's use a regex to match the button 
const newButtons = `
          {/* Download Document Button */}
          <button
            onClick={handleDownloadDocx}
            className="flex items-center space-x-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-900/20 transition-all cursor-pointer ml-4"
            title="Download Document"
          >
            <Download className="w-5 h-5" />
            <span>Download Document</span>
          </button>

          {/* Official Export / Print Button */}
          <button
            onClick={handleExportOrPrint}
`;

content = content.replace(/\{\/\* Official Export \/ Print Button \*\/\}\s*<button\s*onClick=\{handleExportOrPrint\}/, newButtons.trim());

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
