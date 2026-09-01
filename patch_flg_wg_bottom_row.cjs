const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  '<tr className="font-bold">\n              <td className="border border-black p-1 text-right">Total =</td>',
  '<tr className="font-bold">\n              <td className="border border-black p-1 text-left">Total</td>'
);

fs.writeFileSync(path, code);
