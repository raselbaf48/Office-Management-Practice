const fs = require('fs');
let original = fs.readFileSync('settings_copy.tsx', 'utf8');
const getBlock = (startMarker, endMarker) => {
  const start = original.indexOf(startMarker);
  const end = original.indexOf(endMarker, start);
  return original.substring(start, end);
};
const cloudSyncBlock = getBlock("{activeSection === 'cloudsync' && (", "          {/* Section: Users */}");

let selfClosing = cloudSyncBlock.match(/<\s*div[^>]*\/>/g) || [];
console.log(selfClosing);
