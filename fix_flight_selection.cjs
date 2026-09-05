const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the array of flights rendering
code = code.replace(
  /\(\['All', 'Avionics', 'Mechanics', 'GCS', 'Admin'\] as \(FlightName \| 'All'\)\[\]\).map\(\(flt\) => \{/g,
  `(['Avionics', 'Mechanics', 'GCS', 'Admin'] as FlightName[]).map((flt) => {`
);

// update onClick logic to allow deselecting
code = code.replace(
  /onClick=\{\(\) => !isDisabledFlt && setActiveFlight\(flt\)\}/g,
  `onClick={() => !isDisabledFlt && setActiveFlight(activeFlight === flt ? 'All' : flt)}`
);


fs.writeFileSync(file, code);
console.log('Fixed Flight Selection');
