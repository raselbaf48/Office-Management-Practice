const fs = require('fs');
const file = 'src/components/AssignDutyModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const findCode = `    if (isMatrixTracked) {
      const orderedFlights: FlightName[] = ["Avionics", "Mechanics", "GCS", "Admin"];
      let targetFlight: FlightName | "All" = "All";`;

const replaceCode = `    if (isMatrixTracked) {
      const orderedFlights: FlightName[] = ["Avionics", "Mechanics", "GCS", "Admin"];
      let targetFlight: FlightName | "All" = "All";
      
      // Do not auto-select flight for IDAC until a shift is explicitly chosen
      if ((activeDutyCode === 'IDAC' || activeDutyCode === 'IDA') && !activeIdaShift) {
         setActiveFlight("All");
         return;
      }`;

content = content.replace(findCode, replaceCode);
fs.writeFileSync(file, content, 'utf8');
console.log("Patched AssignDutyModal auto-select!");
