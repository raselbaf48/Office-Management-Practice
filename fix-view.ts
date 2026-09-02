import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// Replace the split layout start
code = code.replace(
  /<div className="flex flex-col xl:flex-row gap-6 pb-12 animate-fadeIn">[\s\S]*?<div className="flex-1 space-y-6 w-full xl:w-\[55%\] 2xl:w-\[60%\] overflow-x-auto pb-8 custom-scrollbar">/m,
  '<div className="space-y-6 pb-12 animate-fadeIn">'
);

// Replace the closing div of the split layout and add the modal
code = code.replace(
  /      <\/div>\s*<\/div>\s*\{\/\* Calendar Edit Modal \*\/\}/m,
  `      </div>
      
      {isSettingsOpen && (
        <FlightDutyRatioModal
          date={new Date().toISOString().split('T')[0]}
          onClose={() => setIsSettingsOpen(false)}
          onRatiosUpdated={() => setMatrix(getStoredDutyMatrix())}
        />
      )}

      {/* Calendar Edit Modal */}`
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
