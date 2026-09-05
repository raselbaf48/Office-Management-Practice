const fs = require('fs');

function fixView(file, category) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  // Update interface
  code = code.replace(
    /onViewProfile\?: \(airman: Airman\) => void;/,
    `onViewProfile?: (airman: Airman, config?: any) => void;`
  );

  // Update onClick
  code = code.replace(
    /onClick=\{\(\) => onViewProfile && onViewProfile\(airman\)\}/g,
    `onClick={() => onViewProfile && onViewProfile(airman, { initialTab: 'history', initialCategory: '${category}', historyOnly: true })}`
  );

  fs.writeFileSync(file, code);
}

fixView('src/components/LeaveRegisterView.tsx', 'LEAVE');
fixView('src/components/TdyRegisterView.tsx', 'TDY');
fixView('src/components/DeploymentRegisterView.tsx', 'DUTY'); // Or whatever deployment uses

console.log('Fixed Views');
