const fs = require('fs');
let original = fs.readFileSync('settings_copy.tsx', 'utf8');
const sectionsStart = original.indexOf('const sections = [');
const sectionsEnd = original.indexOf('  return (', sectionsStart);
const sectionsBlock = original.substring(sectionsStart, sectionsEnd);
console.log(sectionsBlock.includes('<div'));
