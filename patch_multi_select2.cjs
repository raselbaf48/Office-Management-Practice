const fs = require('fs');
const file = 'src/components/PrintableParadeStateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /if \(a\.dateJoined && a\.dateJoined > fromDate\) return false;\n\s*if \(a\.dateLeft && a\.dateLeft < fromDate\) return false;\n\s*return a\.flightName === disposalFlight;/g,
  `if (a.dateJoined && a.dateJoined > disposalFromDate) return false;
                  if (a.dateLeft && a.dateLeft < disposalFromDate) return false;
                  return a.flightName === disposalFlight;`
);

fs.writeFileSync(file, content);
