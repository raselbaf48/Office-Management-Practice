import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// Replace DutyRatioSettingsModal import
code = code.replace(
  "import { DutyRatioSettingsModal } from './DutyRatioSettingsModal';",
  "import { DutyRatioConfigPanel } from './DutyRatioConfigPanel';"
);

// We need to inject DutyRatioConfigPanel into the layout.
// Instead of `{isSettingsOpen && ... <DutyRatioSettingsModal .../>}`
code = code.replace(
  /\{\s*isSettingsOpen\s*&&\s*\(role === 'ADMIN' \|\| role === 'SUPER_ADMIN'\)\s*&&\s*\(\s*<DutyRatioSettingsModal onClose=\{.*?\}\s*\/>\s*\)\}/g,
  ""
);

// Now, wrap the main content area in a flex container
// Current main area starts with: <div className="flex-1 overflow-auto p-4 space-y-8">
// Let's replace that.

const mainAreaStart = '<div className="flex-1 overflow-auto p-4 space-y-8">';
const newMainArea = `
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col 2xl:flex-row gap-8 min-h-max">
          {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
            <div className="w-full 2xl:w-[45%] flex-shrink-0">
              <div className="sticky top-0">
                <DutyRatioConfigPanel />
              </div>
            </div>
          )}
          
          <div className="flex-1 space-y-8 w-full 2xl:w-[55%]">
`;

code = code.replace(mainAreaStart, newMainArea);

// The main area is closed before the calendar modal. 
// We need to add closing divs for the new flex layout.
const modalAreaStart = "{/* Calendar Edit Modal */}";
code = code.replace(modalAreaStart, "          </div>\n        </div>\n      </div>\n\n      {/* Calendar Edit Modal */}");

// Also, let's remove the settings button from the header since it's now always visible.
code = code.replace(
  /<button\s*onClick=\{[^}]*setIsSettingsOpen\(true\)\}\s*className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">[\s\S]*?<\/button>/,
  ""
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
