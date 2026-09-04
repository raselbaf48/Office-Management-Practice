const fs = require('fs');
let file = fs.readFileSync('src/components/DashboardParadeState.tsx', 'utf8');

const target1 = `const dateDisplay = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });`;
const target2 = `const dateDisplay = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });`;

if (file.includes(target1) || file.includes(`{ day: '2-digit', month: 'short', year: '2-digit' }`)) {
    file = file.replace(/const dateDisplay = dateObj\.toLocaleDateString\('en-GB', \{ day: '2-digit', month: 'short', year: '2-digit' \}\);/, 
    `const dateDisplay = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // Changed to remove year as requested`);
    
    file = file.replace(/const dateDisplay = dateObj\.toLocaleDateString\('en-GB', \{ day: '2-digit', month: 'short', year: 'numeric' \}\);/, 
    `const dateDisplay = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); // Changed to remove year as requested`);
    
    // Fallback if the exact string isn't matched
    if (file.includes(`month: 'short', year: '2-digit' }`)) {
        file = file.replace(/month:\s*'short',\s*year:\s*'2-digit'\s*\}/g, `month: 'short' }`);
    }
    if (file.includes(`month: 'short', year: 'numeric' }`)) {
        file = file.replace(/month:\s*'short',\s*year:\s*'numeric'\s*\}/g, `month: 'short' }`);
    }
} else {
    // Look for other date formatting
    const genericTarget = /toLocaleDateString\([^)]+\)/g;
    console.log("Found matches:", file.match(genericTarget));
}

// Let's also check for DashboardTopHeader.tsx or TopHeader.tsx if it exists, since the date might be there
fs.writeFileSync('src/components/DashboardParadeState.tsx', file);
console.log('DashboardParadeState updated');
