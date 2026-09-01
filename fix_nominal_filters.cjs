const fs = require('fs');
let content = fs.readFileSync('src/components/NominalRoll.tsx', 'utf-8');

// Change default state to 'All'
content = content.replace("useState<FlightName | 'All' | ''>('')", "useState<FlightName | 'All' | ''>('All')");
content = content.replace("useState<Rank | 'All' | ''>('')", "useState<Rank | 'All' | ''>('All')");

// Fix matchesFlight logic to show all if '' just in case
content = content.replace("flightFilter === '' ? false :", "flightFilter === '' ? true :");

// Replace options in dropdown
content = content.replace('<option value="" disabled>-- Select Flight --</option>', '<option value="All">All Flights</option>');
content = content.replace('<option value="" disabled>-- Select Rank --</option>', '<option value="All">All Ranks</option>');

fs.writeFileSync('src/components/NominalRoll.tsx', content, 'utf-8');
console.log("Fixed Nominal Roll filters");
