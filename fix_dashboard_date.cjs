const fs = require('fs');
let file = fs.readFileSync('src/components/DashboardParadeState.tsx', 'utf8');

// Looking for:
// const dateObj = new Date(selectedDate);
// const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

const targetCode = `  // Compute day of week
  const dateObj = new Date(selectedDate);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });`;

const newCode = `  // Compute day of week
  const dateObj = new Date(selectedDate);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const dateDisplay = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });`;

if (file.includes(targetCode)) {
    file = file.replace(targetCode, newCode);
    
    // Also replace {selectedDate} with {dateDisplay} in the header
    file = file.replace(/{dayName}, {selectedDate} • Unit Strength:/g, `{dayName}, {dateDisplay} • Unit Strength:`);
    
    fs.writeFileSync('src/components/DashboardParadeState.tsx', file);
    console.log('Fixed DashboardParadeState date format');
} else {
    console.log('Target code not found in DashboardParadeState');
}
