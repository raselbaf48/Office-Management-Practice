const fs = require('fs');

let file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /initialFlightFilter=\{selectedFlight === "All" \? "All" : selectedFlight\}/,
  `initialFlightFilter={selectedFlight === "Overall" || selectedFlight === "All" ? "All" : selectedFlight}`
);

fs.writeFileSync(file, code);
console.log("Fixed App.tsx initialFlightFilter");
