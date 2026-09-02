const fs = require('fs');

const files = [
  'src/components/ParadeStateFormattedView.tsx',
  'src/components/NightCountStateView.tsx',
  'src/components/MonthlyDutyRegister.tsx',
  'src/components/DutyRosterPeriodView.tsx',
  'src/components/LeaveRegisterView.tsx',
  'src/components/TdyRegisterView.tsx',
  'src/components/DeploymentRegisterView.tsx',
  'src/components/NominalRoll.tsx',
  'src/components/DutyAnalytics.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // Find <button ...> <RefreshCw ... /> ... </button>
  // A generic way is to use regex with careful boundaries, or just string replacement if we know the exact lines.
  
  // Example from ParadeStateFormattedView:
  // <button
  //   onClick={fetchCurrentRoster}
  //   className="..."
  //   title="Refresh Data"
  // >
  //   <RefreshCw ... />
  //   <span ...>Refresh</span>
  // </button>
  
  // A simpler regex to remove the button block containing RefreshCw and the text Refresh
  // We look for <button[^>]*>.*?<RefreshCw.*?<\/button>
  code = code.replace(/<button[^>]*>[^<]*<RefreshCw[^>]*\/>[\s\S]*?<\/button>/g, '');
  
  fs.writeFileSync(file, code);
}
