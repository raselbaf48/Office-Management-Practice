const fs = require('fs');

function ensureTodayStr(filename) {
  let code = fs.readFileSync(filename, 'utf8');
  if (!code.includes('const todayStr = new Date().toISOString().split')) {
    code = code.replace(/const \[selectedFlight, setSelectedFlight\] = useState/, 
      "const todayStr = new Date().toISOString().split('T')[0];\n  const [selectedFlight, setSelectedFlight] = useState");
  }
  fs.writeFileSync(filename, code);
}

ensureTodayStr('src/components/DeploymentRegisterView.tsx');
ensureTodayStr('src/components/LeaveRegisterView.tsx');
ensureTodayStr('src/components/TdyRegisterView.tsx');

