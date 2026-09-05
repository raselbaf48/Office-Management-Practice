const fs = require('fs');

let file = 'src/components/AirmanProfileModal.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /\{onEditAirman && \(/,
  '{onEditAirman && !historyOnly && ('
);

fs.writeFileSync(file, code);
