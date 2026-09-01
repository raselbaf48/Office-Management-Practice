const fs = require('fs');

const file = 'src/components/AddEditAirmanModal.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  /const \[flightName, setFlightName\] = useState<FlightName>\([\s\n]*airmanToEdit\?\.flightName \|\| 'Avionics'[\s\n]*\);/,
  "const [flightName, setFlightName] = useState<FlightName | ''>(airmanToEdit?.flightName || '');"
);

content = content.replace(
  /<select[\s\n]*value=\{flightName\}[\s\n]*onChange=\{\(e\) => setFlightName\(e\.target\.value as FlightName\)\}/,
  `<select
                value={flightName}
                onChange={(e) => setFlightName(e.target.value as FlightName)}`
);

// Add empty option
content = content.replace(
  /<option value="Avionics">Avionics Flight<\/option>/,
  `<option value="" disabled>-- Select Flight --</option>
                <option value="Avionics">Avionics Flight</option>`
);

content = content.replace(
  /if \(!trade\.trim\(\)\) return setValidationError\('Please enter a Trade'\);/,
  `if (!trade.trim()) return setValidationError('Please enter a Trade');
    if (!flightName) return setValidationError('Please select a Flight');`
);

fs.writeFileSync(file, content, 'utf-8');
console.log('Patched AddEditAirmanModal flight default');
