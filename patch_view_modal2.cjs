const fs = require('fs');
let code = fs.readFileSync('src/components/ParadeStateFormattedView.tsx', 'utf8');

const regex = /<PrintableParadeStateModal\s*userFlight=\{userFlight\}\s*date=\{fromDate\}\s*shift="Morning"\s*flight=\{selectedFlight\}\s*airmen=\{airmen\}\s*documentType=\{isPtDocument \? 'PT' : 'PARADE'\}\s*onClose=\{\(\) => setIsInternalPrintOpen\(false\)\}\s*\/>/m;

code = code.replace(regex, \`<PrintableParadeStateModal userFlight={userFlight} initialFromDate={fromDate} initialToDate={toDate} shift="Morning" flight={selectedFlight} airmen={airmen} documentType={isPtDocument ? 'PT' : 'PARADE'} onClose={() => setIsInternalPrintOpen(false)} />\`);

fs.writeFileSync('src/components/ParadeStateFormattedView.tsx', code);
