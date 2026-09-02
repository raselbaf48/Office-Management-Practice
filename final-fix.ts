import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// 1. Swap import
code = code.replace(
  /import \{ FlightDutyRatioModal \} from '\.\/FlightDutyRatioModal';/,
  "import { DutyRatioConfigPanel } from './DutyRatioConfigPanel';"
);

// 2. Remove settings button
code = code.replace(
  /\{\(role === 'ADMIN' \|\| role === 'SUPER_ADMIN'\) && \(\s*<button\s*onClick=\{[^}]*\}\s*className="p-2 bg-slate-100[^>]*>\s*<Sliders className="w-4 h-4" \/>\s*<\/button>\s*\)\}/g,
  ""
);

// 3. Side-by-side layout start
code = code.replace(
  /<div className="space-y-6 pb-12 animate-fadeIn">/,
  `<div className="flex flex-col xl:flex-row gap-6 pb-12 animate-fadeIn">
      {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <div className="w-full xl:w-[45%] 2xl:w-[40%] flex-shrink-0">
          <div className="sticky top-6 h-[calc(100vh-100px)] flex flex-col overflow-hidden">
            <DutyRatioConfigPanel />
          </div>
        </div>
      )}
      
      <div className="flex-1 space-y-6 w-full xl:w-[55%] 2xl:w-[60%] overflow-x-auto pb-8 custom-scrollbar">`
);

// 4. Remove inline settings modal & close flex container
const modalRegex = /\{isSettingsOpen && \(\s*<FlightDutyRatioModal[\s\S]*?\/>\s*\)\}/g;
code = code.replace(modalRegex, "</div>"); // Close the flex-1 space-y-6 div

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
