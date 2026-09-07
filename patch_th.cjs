const fs = require('fs');

const file = 'src/components/MonthlyDutyRegister.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add text-center to th that don't have it
content = content.replace(/<th className="([^"]*)"/g, (match, p1) => {
  if (!p1.includes('text-center') && !p1.includes('text-left') && !p1.includes('text-right')) {
    return `<th className="${p1} text-center"`;
  }
  return match;
});

// Also check td elements
content = content.replace(/<td className="([^"]*)"/g, (match, p1) => {
  if (!p1.includes('text-center') && !p1.includes('text-left') && !p1.includes('text-right')) {
    return `<td className="${p1} text-center"`;
  }
  return match;
});

fs.writeFileSync(file, content, 'utf8');
console.log('Patched th/td alignment in MonthlyDutyRegister');
