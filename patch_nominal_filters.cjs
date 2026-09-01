const fs = require('fs');

const file = 'src/components/NominalRoll.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Change defaults to '' instead of 'All'
content = content.replace(
  /const \[flightFilter, setFlightFilter\] = useState<FlightName \| 'All'>\('All'\);/,
  "const [flightFilter, setFlightFilter] = useState<FlightName | 'All' | ''>('');"
);
content = content.replace(
  /const \[rankFilter, setRankFilter\] = useState<Rank \| 'All'>\('All'\);/,
  "const [rankFilter, setRankFilter] = useState<Rank | 'All' | ''>('');"
);

// Update filter logic: if filter is '', nothing matches (or maybe it just matches none? Or maybe the table should still show 'All'?)
// The user says "Nominal Roll e By default kono option selec thakbe na", which probably means no data is shown, or it just defaults to showing nothing.
// Let's make it so if flightFilter === '' or rankFilter === '', it returns false, meaning 0 airmen shown until they select 'All' or a specific flight.
content = content.replace(
  /const matchesFlight = flightFilter === 'All' \|\| airman\.flightName === flightFilter;/,
  "const matchesFlight = flightFilter === 'All' || (flightFilter !== '' && airman.flightName === flightFilter);"
);
content = content.replace(
  /const matchesRank = rankFilter === 'All' \|\| airman\.rank === rankFilter;/,
  "const matchesRank = rankFilter === 'All' || (rankFilter !== '' && airman.rank === rankFilter);"
);

// Add default option to the selects
content = content.replace(
  /<select[\s\n]*value=\{flightFilter\}[\s\n]*onChange=\{\(e\) => setFlightFilter\(e\.target\.value as any\)\}/,
  `<select
              value={flightFilter}
              onChange={(e) => setFlightFilter(e.target.value as any)}`
);

content = content.replace(
  /\{flightsList\.map\(\(fl\) => \(/,
  `<option value="" disabled>-- Select Flight --</option>
              {flightsList.map((fl) => (`
);

content = content.replace(
  /<select[\s\n]*value=\{rankFilter\}[\s\n]*onChange=\{\(e\) => setRankFilter\(e\.target\.value as any\)\}/,
  `<select
              value={rankFilter}
              onChange={(e) => setRankFilter(e.target.value as any)}`
);

content = content.replace(
  /\{ranksList\.map\(\(rk\) => \(/,
  `<option value="" disabled>-- Select Rank --</option>
              {ranksList.map((rk) => (`
);

// To prevent showing the entire list when '' is selected:
// Wait, if flightFilter is '', should matchesFlight be true or false?
// If matchesFlight is false, the table is empty! Let's make matchesFlight = false if flightFilter === ''.
// Oh wait, I did `flightFilter !== '' && airman.flightName === flightFilter`. 
// So if it's '', it evaluates to false, so the table is empty. But wait, if they want to see all airmen, they have to select "All Flights". This is perfect.

fs.writeFileSync(file, content, 'utf-8');
console.log('Patched Nominal Roll filters');
