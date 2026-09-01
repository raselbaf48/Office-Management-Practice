const fs = require('fs');
const file = 'src/components/NominalRoll.tsx';
let content = fs.readFileSync(file, 'utf-8');

// If flight is not selected (''), don't show any airmen. 
// If rank is not selected (''), treat it as 'All Ranks' so they don't HAVE to select a rank to see people.
content = content.replace(
  /const matchesFlight = [^\n]*;/g,
  "const matchesFlight = flightFilter === '' ? false : (flightFilter === 'All' || airman.flightName === flightFilter);"
);
content = content.replace(
  /const matchesRank = [^\n]*;/g,
  "const matchesRank = rankFilter === '' ? true : (rankFilter === 'All' || airman.rank === rankFilter);"
);

// We should also change rankFilter default to 'All' or '' ? Let's keep it ''. 
fs.writeFileSync(file, content, 'utf-8');
console.log('Patched matchesFlight and matchesRank logic');
