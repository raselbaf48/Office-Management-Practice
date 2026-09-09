const fs = require('fs');
let content = fs.readFileSync('src/components/DutyRatioMatrixView.tsx', 'utf8');

// handleCellUpdate
content = content.replace(
  /updated\[tableIndex\] = tableObj;\n    setMatrix\(updated\);\n    setIsSaved\(false\);/g,
  `updated[tableIndex] = tableObj;
    setMatrix(updated);
    saveDutyMatrix(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);`
);

// handleResetTable
content = content.replace(
  /updated\[tableIndex\] = tableObj;\n    setMatrix\(updated\);\n    setIsSaved\(false\);/g,
  `updated[tableIndex] = tableObj;
    setMatrix(updated);
    saveDutyMatrix(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);`
);

// from Calendar popover
content = content.replace(
  /updated\[editingCalendar\.tableIdx\]\.data\[editingCalendar\.flight\] = newData;\n            setMatrix\(updated\);\n            setIsSaved\(false\);/g,
  `updated[editingCalendar.tableIdx].data[editingCalendar.flight] = newData;
            setMatrix(updated);
            saveDutyMatrix(updated);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);`
);

// from Settings popover (RandomizedKeypad)
// We need to see how settings are saved.
fs.writeFileSync('src/components/DutyRatioMatrixView.tsx', content, 'utf8');
