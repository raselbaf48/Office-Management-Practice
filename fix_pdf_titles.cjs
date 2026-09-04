const fs = require('fs');

// 1. Fix PrintableFlyingWingModal (Consolidated Night Count State)
let flgContent = fs.readFileSync('src/components/PrintableFlyingWingModal.tsx', 'utf8');
flgContent = flgContent.replace(
  /document\.title = `Consolidated Night Count State - Flg Wg \(\$\{formatted\}\)`;/g,
  "document.title = `Consolidated Night Count State - Flg Wg (${formatted})`;" // Just ensuring correctness
);
fs.writeFileSync('src/components/PrintableFlyingWingModal.tsx', flgContent);

// 2. Fix PrintableNightCountModal
let ntContent = fs.readFileSync('src/components/PrintableNightCountModal.tsx', 'utf8');
ntContent = ntContent.replace(
  /Night Count State - 155 UASU BAF \(\$\{formattedDate\}\)/g,
  "Night Count State - 155 UASU BAF (${formattedDate})"
);
fs.writeFileSync('src/components/PrintableNightCountModal.tsx', ntContent);

// 3. Fix PrintableParadeStateModal
let paradeContent = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');

// Insert document.title logic right after `setActivePreset` state
if (!paradeContent.includes('const getPdfTitle = () => {')) {
  const insertIndex = paradeContent.indexOf('useEffect(() => {\n    setFromDate(selectedDate);');
  
  if (insertIndex > -1) {
    const newTitleLogic = `
  const getPdfTitle = () => {
    const formattedDate = formatDateShort(fromDate);
    if (dateMode === 'single') {
       return \`\${isPtDocument ? 'PT' : 'Parade'} State - Airmen (\${formattedDate})\`;
    } else {
       return \`Multi Day \${isPtDocument ? 'PT' : 'Parade'} State \${selectedFlight} (\${formattedDate} to \${formatDateShort(toDate)})\`;
    }
  };

  useEffect(() => {
    const originalTitle = document.title;
    document.title = getPdfTitle();

    const handleBeforePrint = () => {
      document.title = getPdfTitle();
    };

    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      document.title = originalTitle;
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [fromDate, toDate, dateMode, isPtDocument, selectedFlight]);

  `;
    paradeContent = paradeContent.slice(0, insertIndex) + newTitleLogic + paradeContent.slice(insertIndex);
    fs.writeFileSync('src/components/PrintableParadeStateModal.tsx', paradeContent);
  }
}

console.log("Fixed PDF titles");
