const fs = require('fs');

const file = 'src/components/MonthlyDutyRegister.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace text-left on tables with text-center
content = content.replace(/<table className="w-full text-left/g, '<table className="w-full text-center');

// Also, the Name/BD No column is better off left-aligned or centered? Usually names are left-aligned for readability.
// Let's see if we should leave names left-aligned but center others.
// The user says "Table maximum Central Align korar try korba, jodi dekhte valo lage, Tmr moto alaignment kore dao sob". 
// I'll make the main table text-center, but the Name column in MonthlyDutyRegister is usually left-aligned. I'll just change the global table class to center, and leave specific columns if they have their own class. Wait, the table had text-left globally. Let's change to text-center.

fs.writeFileSync(file, content, 'utf8');
console.log('Patched MonthlyDutyRegister alignment');
