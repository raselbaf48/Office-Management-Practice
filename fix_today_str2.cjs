const fs = require('fs');

function ensureTodayStrTop(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  
  // Replace the exact line
  code = code.replace(/const \[selectedFlight, setSelectedFlight\] = useState/, 
      "const todayStr = new Date().toISOString().split('T')[0];\n  const [selectedFlight, setSelectedFlight] = useState");

  fs.writeFileSync(filename, code);
}

ensureTodayStrTop('src/components/DeploymentRegisterView.tsx');
ensureTodayStrTop('src/components/LeaveRegisterView.tsx');
ensureTodayStrTop('src/components/TdyRegisterView.tsx');

