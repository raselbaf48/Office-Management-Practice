const fs = require('fs');

let flgContent = fs.readFileSync('src/components/PrintableFlyingWingModal.tsx', 'utf8');
flgContent = flgContent.replace(
  /const formatted = new Date\(date\)/g,
  "// moved outside"
);
flgContent = flgContent.replace(
  /export const PrintableFlyingWingModal = \(\{ date, uasuStats, onClose \}: any\) => \{/,
  "export const PrintableFlyingWingModal = ({ date, uasuStats, onClose }: any) => {\n  const formatted = new Date(date).toLocaleDateString(\"en-GB\", {day:\"2-digit\", month:\"short\", year: '2-digit'}).replace(/ /g, ' ');"
);
fs.writeFileSync('src/components/PrintableFlyingWingModal.tsx', flgContent);


let paradeContent = fs.readFileSync('src/components/PrintableParadeStateModal.tsx', 'utf8');
const insertIndex = paradeContent.indexOf('useEffect(() => {'); // Find first useEffect
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

