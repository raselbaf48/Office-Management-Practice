const fs = require('fs');
let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

// Fix outermost container
content = content.replace(
  '<div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn overflow-hidden  print:block text-black "',
  '<div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 print:bg-white animate-fadeIn overflow-hidden print:static print:h-auto print:w-auto print:overflow-visible print:block text-black "'
);

// We should also remove flex from the container wrapping the tables so they are strictly block
// The row with "TOTAL DUTY" and "EFFECTIVE MANPOWER"
content = content.replace(
  '<div className="flex justify-center gap-12">',
  '<div className="flex justify-center gap-12 print:block print:space-y-8">'
);

// Check if there are other flex wrappers
content = content.replace(
  '<div className="flex justify-center gap-12 print:block print:space-y-8">', // Just in case it was already replaced
  '<div className="flex justify-center gap-12 print:block print:space-y-8">'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
