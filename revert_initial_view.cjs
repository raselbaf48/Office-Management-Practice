const fs = require('fs');
let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

// 1. Remove hideEmptyColumns state
content = content.replace(
  "  const [hideEmptyColumns, setHideEmptyColumns] = useState<boolean>(false);\n", 
  ""
);

// 2. Fix the buttons
const buttonsTarget = `{isMultiDay && (
          <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 ml-4 cursor-pointer select-none">
            <input 
              type="checkbox" 
              className="w-3.5 h-3.5 cursor-pointer accent-emerald-600" 
              checked={hideEmptyColumns}
              onChange={(e) => setHideEmptyColumns(e.target.checked)}
            />
            <span>Hide Empty Columns</span>
          </label>
        )}
        {/* Official Export / Print Button */}`;

const restoredButtons = `{/* Download DOCX Button */}
        <button
          onClick={handleDownloadDocx}
          className="flex items-center space-x-1.5 px-6 py-2 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-900/20 transition-all cursor-pointer ml-4"
          title="Download DOCX"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
          <span>Download DOCX</span>
        </button>
        {/* Official Export / Print Button */}`;

content = content.replace(buttonsTarget, restoredButtons);

// 3. Remove hide logic but keep custom column logic in initial view, OR should I just use the original file?
fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
