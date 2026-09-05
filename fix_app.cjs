const fs = require('fs');
const file = 'src/App.tsx';

let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /<NominalRoll\s+airmen=\{airmen\}/,
  '<NominalRoll\n              initialFlightFilter={selectedFlight === "All" ? "All" : selectedFlight}\n              airmen={airmen}'
);

fs.writeFileSync(file, code);
