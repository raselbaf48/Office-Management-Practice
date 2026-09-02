const fs = require('fs');

let original = fs.readFileSync('settings_copy.tsx', 'utf8');

const getBlock = (startMarker, endMarker) => {
  const start = original.indexOf(startMarker);
  const end = original.indexOf(endMarker, start);
  return original.substring(start, end);
};

const cloudSyncBlock = getBlock("{activeSection === 'cloudsync' && (", "          {/* Section: Users */}");

let opens = cloudSyncBlock.match(/<div/g) || [];
let closes = cloudSyncBlock.match(/<\/div/g) || [];
console.log(opens.length, closes.length);
