import fs from 'fs';
let code = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

const targetStr = '<div className="space-y-6 pb-12 animate-fadeIn">';
const replacementStr = `
    <div className="flex flex-col xl:flex-row gap-6 pb-12 animate-fadeIn">
      {(role === 'ADMIN' || role === 'SUPER_ADMIN') && (
        <div className="w-full xl:w-[45%] 2xl:w-[40%] flex-shrink-0">
          <div className="sticky top-6 h-[calc(100vh-100px)] flex flex-col overflow-hidden">
            <DutyRatioConfigPanel />
          </div>
        </div>
      )}
      
      <div className="flex-1 space-y-6 w-full xl:w-[55%] 2xl:w-[60%] overflow-x-auto pb-8 custom-scrollbar">
`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  
  // Now add the closing div
  const endMarker = "{/* Calendar Edit Modal */}";
  if (code.includes(endMarker)) {
    code = code.replace(endMarker, "      </div>\n\n      " + endMarker);
  }
  
  fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', code);
  console.log("Injected Config Panel");
} else {
  console.log("Target string not found");
}
