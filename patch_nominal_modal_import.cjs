const fs = require('fs');

const file = 'src/components/AddEditAirmanModal.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Ensure FlightName is still handled properly and there's no syntax errors in AddEditAirmanModal
console.log(content.includes('const [flightName, setFlightName] = useState<FlightName | \'\'>(airmanToEdit?.flightName || \'\');'));
