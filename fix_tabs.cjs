const fs = require('fs');
let code = fs.readFileSync('src/components/DutyRatioConfigPanel.tsx', 'utf-8');

// Find the end of the MANPOWER block (before DISTRIBUTION AS PER MANPOWER)
const distributionStart = "{/* DISTRIBUTION AS PER MANPOWER */}";
code = code.replace(
  distributionStart,
  `        </>
      )}

      {(!activeTab || activeTab === 'DUTY_DISTRIBUTION') && (
        <>
          ${distributionStart}`
);

fs.writeFileSync('src/components/DutyRatioConfigPanel.tsx', code);
