const fs = require('fs');
let content = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

content = content.replace(
  /<button\n          onClick=\{handleSave\}\n          className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"\n        >\n          \{isSaved \? <Check className="w-4 h-4" \/> : <Save className="w-4 h-4" \/>\}\n          <span className="hidden sm:inline">\{isSaved \? 'Saved!' : 'Save All Changes'\}<\/span>\n          <span className="sm:hidden">\{isSaved \? 'Saved' : 'Save'\}<\/span>\n        <\/button>/g,
  `{/* Auto-saved instantly, button removed as requested */}`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', content, 'utf8');
