const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const btn = `              <button
                type="button"
                onClick={handleSave}
                className={\`px-3.5 py-2 text-xs font-bold text-white rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer \${
                  isSaved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }\`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
              </button>`;

code = code.replace(btn, '');
fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
