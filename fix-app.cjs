const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const t = "              onOpenPrintModal={() => setIsPrintModalOpen(true)}\\n              isPrintMode={isPrintModalOpen}\\n              onClosePrintMode={() => setIsPrintModalOpen(false)}\\n              onViewAirmanProfile={(a, config) => setSelectedAirmanProfile({ airman: a, ...config })}\\n              onOpenImportModal={() => setIsPdfImportModalOpen(true)}\\n            />\\n          )}\\n          {activeTab === 'parade-state' && (";

const r = "              onOpenPrintModal={() => setIsPrintModalOpen(true)}\\n              onViewAirmanProfile={(a, config) => setSelectedAirmanProfile({ airman: a, ...config })}\\n              onOpenImportModal={() => setIsPdfImportModalOpen(true)}\\n            />\\n          )}\\n          {activeTab === 'parade-state' && (";

content = content.replace(t, r);
fs.writeFileSync('src/App.tsx', content);
