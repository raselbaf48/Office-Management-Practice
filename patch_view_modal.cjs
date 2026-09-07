const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const target = `<PrintableParadeStateModal userFlight={userFlight} 
 date={fromDate} shift="Morning" flight={selectedFlight} airmen={airmen} documentType={isPtDocument ? 'PT' : 'PARADE'} onClose={() => setIsInternalPrintOpen(false)} />`;

const replacement = `<PrintableParadeStateModal userFlight={userFlight} 
 initialFromDate={fromDate} initialToDate={toDate} shift="Morning" flight={selectedFlight} airmen={airmen} documentType={isPtDocument ? 'PT' : 'PARADE'} onClose={() => setIsInternalPrintOpen(false)} />`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
