const fs = require('fs');

function fix(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/<th className="border border-black p-1 w-24">Sqn\/Unit<\/th>/, '<th className="border border-black p-1 w-24 align-middle text-center">Sqn/Unit</th>');
  content = content.replace(/<th className="border border-black p-1 w-16">Rmks<\/th>/, '<th className="border border-black p-1 w-16 align-middle text-center">Rmks</th>');
  content = content.replace(/<th className="border-r border-black p-2 w-24">Sqn\/Unit<\/th>/, '<th className="border-r border-black p-2 w-24 align-middle text-center">Sqn/Unit</th>');
  content = content.replace(/<th className="p-2 align-middle font-bold text-center" style=\{\{ writingMode: 'vertical-rl', transform: 'rotate\(180deg\)' \}\}>Remarks<\/th>/, '<th className="p-2 align-middle text-center"><div className="w-full h-32 flex items-center justify-center [writing-mode:vertical-lr] [transform:rotate(180deg)] text-[10px] leading-tight">Remarks</div></th>');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

fix('src/components/FlyingWingStateView.tsx');
fix('src/components/PrintableNightCountModal.tsx');
