import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

code = code.replace(
  'className="flex flex-col 2xl:flex-row gap-8 min-h-max"',
  'className="flex flex-col xl:flex-row gap-6 h-full min-h-0"'
);

code = code.replace(
  'className="w-full 2xl:w-[45%] flex-shrink-0"',
  'className="w-full xl:w-[40%] flex-shrink-0 h-full overflow-hidden flex flex-col"'
);

code = code.replace(
  'className="sticky top-0"',
  'className="h-full overflow-y-auto custom-scrollbar pr-2"'
);

code = code.replace(
  'className="flex-1 space-y-8 w-full 2xl:w-[55%]"',
  'className="flex-1 space-y-8 w-full xl:w-[60%] h-full overflow-y-auto custom-scrollbar pr-2 pb-12"'
);

// We should also make the main container not scroll, but let its children scroll
code = code.replace(
  '<div className="flex-1 overflow-auto p-4">',
  '<div className="flex-1 overflow-hidden p-4">'
);

fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
