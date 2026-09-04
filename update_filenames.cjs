const fs = require('fs');

let content = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

// For Multi Day
content = content.replace(
  /'Document\.docx',/g,
  "`${isPtDocument ? 'PT' : 'Parade'} State - Airmen (${formatDateShort(fromDate)}).docx`,"
);

// For Single Day
content = content.replace(
  /    \}, 'Document\.docx'\);/g,
  "    }, `${isPtDocument ? 'PT' : 'Parade'} State - Airmen (${formatDateShort(fromDate)}).docx`);"
);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', content);
console.log("Updated ParadeStateFormattedView.tsx");
