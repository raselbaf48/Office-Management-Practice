const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const toRemove = `
          {/* Download Document Button */}
          <button
            onClick={handleDownloadDocx}
            className="flex items-center space-x-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-900/20 transition-all cursor-pointer ml-4"
            title="Download Document"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            <span>Download Document</span>
          </button>
`;

content = content.replace(toRemove, "");
// handle cases where indentation might be slightly different
content = content.replace(/\{\/\* Download Document Button \*\/\}[\s\S]*?<\/button>/, '');

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
