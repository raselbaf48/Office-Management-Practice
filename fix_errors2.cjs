const fs = require('fs');

let paradeContent = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

paradeContent = paradeContent.replace(
  /if \(dateMode === 'single'\) \{/g,
  "if (!isMultiDay) {"
);

// We need to define getPdfTitle AFTER isMultiDay is defined, or just use fromDate === toDate.
paradeContent = paradeContent.replace(
  /if \(!isMultiDay\) \{/g,
  "if (fromDate === toDate) {"
);

paradeContent = paradeContent.replace(
  /, dateMode, /g,
  ", "
);

fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', paradeContent);

