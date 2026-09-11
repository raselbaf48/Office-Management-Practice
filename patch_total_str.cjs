const fs = require('fs');
const file = 'src/components/PrintableParadeStateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The function is getFlightStats(fl: FlightName | 'Overall')
// I need to add activeAirmen filtering using 'fromDate' which is the selected date in this modal.

const targetStr = `  const getFlightStats = (fl: FlightName | 'Overall') => {
    const flightAirmen = fl === 'Overall' ? airmen : airmen.filter((a) => a.flightName === fl);`;

const replacementStr = `  const getFlightStats = (fl: FlightName | 'Overall') => {
    const activeAirmen = airmen.filter((a) => {
      if (a.dateJoined && a.dateJoined > fromDate) return false;
      if (a.dateLeft && a.dateLeft < fromDate) return false;
      return true;
    });
    const flightAirmen = fl === 'Overall' ? activeAirmen : activeAirmen.filter((a) => a.flightName === fl);`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content);
  console.log("Patched PrintableParadeStateModal Total Str for getFlightStats");
} else {
  console.log("Could not find getFlightStats in PrintableParadeStateModal");
}
