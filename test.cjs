const file = require('fs').readFileSync('src/components/DashboardParadeState.tsx', 'utf8');
const match = file.match(/dateObj.toLocaleDateString\('en-GB', \{[^}]+\}\)/);
console.log(match ? match[0] : "Not found");
