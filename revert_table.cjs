const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

file = file.replace(
  /<table className="w-full text-center border-collapse border-2 border-black text-xs font-bold">/,
  '<table className="w-full text-[9px] border-collapse" style={{ textAlign: \'center\' }}>'
);
file = file.replace(/border-2 border-black/g, 'border border-black');

fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
