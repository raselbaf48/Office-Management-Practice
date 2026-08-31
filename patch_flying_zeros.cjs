const fs = require('fs');
let file = fs.readFileSync('src/components/FlyingWingStateView.tsx', 'utf-8');

file = file.replace(
  '<td className="border border-black p-1 ">{effStr || \'\'}</td>',
  '<td className="border border-black p-1 ">{effStr === 0 ? \'0\' : effStr || \'\'}</td>'
);

file = file.replace(
  '<td className="border border-black p-1 ">{totalOut || \'\'}</td>',
  '<td className="border border-black p-1 ">{totalOut === 0 ? \'0\' : totalOut || \'\'}</td>'
);

file = file.replace(
  '<td className="border border-black p-1 ">{onPt || \'\'}</td>',
  '<td className="border border-black p-1 ">{onPt === 0 ? \'0\' : onPt || \'\'}</td>'
);

fs.writeFileSync('src/components/FlyingWingStateView.tsx', file, 'utf-8');
