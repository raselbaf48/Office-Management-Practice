const fs = require('fs');
const file = 'src/components/PrintableParadeStateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const getFlightStats = \(fl: FlightName \| 'Overall'\) => \{\s*const flightAirmen = fl === 'Overall' \? airmen : airmen\.filter\(\(a\) => a\.flightName === fl\);/;

const replacementStr = `const getFlightStats = (fl: FlightName | 'Overall') => {
    const activeAirmen = airmen.filter((a) => {
      if (a.dateJoined && a.dateJoined > fromDate) return false;
      if (a.dateLeft && a.dateLeft < fromDate) return false;
      return true;
    });
    const flightAirmen = fl === 'Overall' ? activeAirmen : activeAirmen.filter((a) => a.flightName === fl);`;

if (regex.test(content)) {
  content = content.replace(regex, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Patched PrintableParadeStateModal with Regex.");
} else {
  console.log("Could not find regex match.");
}
