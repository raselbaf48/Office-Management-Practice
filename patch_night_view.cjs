const fs = require('fs');
let code = fs.readFileSync('src/components/NightCountStateView.tsx', 'utf8');

const regex = /<PrintableNightCountModal\s*userFlight=\{userFlight\}\s*role=\{role\}\s*selectedDate=\{selectedDate\}\s*setSelectedDate=\{setSelectedDate\}\s*airmen=\{airmen\}\s*onClose=\{\(\) => setIsInternalPrintOpen\(false\)\}\s*\/>/m;

code = code.replace(regex, \`<PrintableNightCountModal userFlight={userFlight} 
          role={role}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          initialFromDate={fromDate}
          initialToDate={toDate}
          airmen={airmen}
          onClose={() => setIsInternalPrintOpen(false)}
        />\`);

fs.writeFileSync('src/components/NightCountStateView.tsx', code);
