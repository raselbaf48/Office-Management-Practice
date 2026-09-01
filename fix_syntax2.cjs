const fs = require('fs');

const file = 'src/components/NightCountStateView.tsx';
let content = fs.readFileSync(file, 'utf-8');

const target1 = `            {/* OFFICIAL SIGNATURE FOOTER FOR MULTI-DAY */}
            <div
              className="flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >`;

const replacement1 = `            {/* OFFICIAL SIGNATURE FOOTER FOR MULTI-DAY */}
            {activeTab !== '155 UASU BAF' && (
            <div
              className="flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >`;

content = content.replace(target1, replacement1);

const target2 = `            {/* OFFICIAL SIGNATURE FOOTER */}
            <div
              className="flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >`;

const replacement2 = `            {/* OFFICIAL SIGNATURE FOOTER */}
            {activeTab !== '155 UASU BAF' && (
            <div
              className="flex justify-between items-end pt-1 text-black text-xs min-w-[700px] print:min-w-0"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >`;

content = content.replace(target2, replacement2);

fs.writeFileSync(file, content, 'utf-8');
console.log("Fixed syntax 2");
