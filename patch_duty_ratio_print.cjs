const fs = require('fs');

let content = fs.readFileSync('src/components/PrintableDutyRatioModal.tsx', 'utf8');

content = content.replace(
  '<div className="flex flex-col gap-10">',
  '<div className="flex flex-col gap-10 print:block print:space-y-10">'
);

content = content.replace(
  '{/* DISTRIBUTION AS PER MANPOWER Table */}\n              <div>',
  '{/* DISTRIBUTION AS PER MANPOWER Table */}\n              <div className="print:break-inside-avoid">'
);

content = content.replace(
  '{/* DISTRIBUTION AS PER FLIGHT Table */}\n              <div>',
  '{/* DISTRIBUTION AS PER FLIGHT Table */}\n              <div className="print:break-inside-avoid print:mt-10">'
);

fs.writeFileSync('src/components/PrintableDutyRatioModal.tsx', content, 'utf8');
