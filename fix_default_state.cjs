const fs = require('fs');
const path = 'src/components/FlyingWingStateView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  "return saved ? JSON.parse(saved) : ['Det/Tdy', 'Leave', 'Sick report', 'Office Duty'];",
  "return saved ? JSON.parse(saved) : [];"
);
code = code.replace(
  "} catch { return ['Det/Tdy', 'Leave', 'Sick report', 'Office Duty']; }",
  "} catch { return []; }"
);

fs.writeFileSync(path, code);
