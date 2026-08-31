const fs = require('fs');

const data = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

let newData = data.replace(
  '<table className="w-full text-center border-collapse border border-black text-xs font-bold">',
  '<table className="w-full text-center border-collapse border border-black text-[11px]">'
);

newData = newData.replace(
  '<thead>',
  '<thead className="font-bold">'
);

newData = newData.replace(
  '<tr className="font-bold bg-slate-50">',
  '<tr className="font-bold bg-slate-50 text-[12px]">'
);

fs.writeFileSync('src/components/FlyingWingStateView.tsx', newData, 'utf-8');
